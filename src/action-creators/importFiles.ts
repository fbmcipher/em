import * as idb from 'idb-keyval'
import _ from 'lodash'
import Index from '../@types/IndexType'
import Path from '../@types/Path'
import State from '../@types/State'
import ThoughtId from '../@types/ThoughtId'
import ThoughtIndices from '../@types/ThoughtIndices'
import Thunk from '../@types/Thunk'
import createThought from '../action-creators/createThought'
import importText from '../action-creators/importText'
import { AlertType, HOME_TOKEN } from '../constants'
import { exportContext } from '../selectors/exportContext'
import getRankBefore from '../selectors/getRankBefore'
import rootedParentOf from '../selectors/rootedParentOf'
import simplifyPath from '../selectors/simplifyPath'
import chunkOutline from '../util/chunkOutline'
import createChildrenMap from '../util/createChildrenMap'
import createId from '../util/createId'
import head from '../util/head'
import initialState from '../util/initialState'
import parentOf from '../util/parentOf'
import series from '../util/series'
import alert from './alert'

/** Meta information for a file import that is stored in IDB and automatically resumed on initialize. */
interface ResumeImport {
  // unique id for the import
  // importing the same file a second time will generate a new ResumeImport with a new id
  id: string
  lastModified: number
  // lines of the file that have already been imported
  linesCompleted: number
  name: string
  // import destination path
  path: Path
  size: number
}

// The number of lines of text that are imported at once.
// This is kept small to ensure that slower devices report steady progress, but large enough to reduce state churn.
// The bottleneck is IDB, so the overhead for a high number of small chunks should be minimal as long as it involves the same number of IDB transactions. This is assumed to be the case since each thought and lexeme has a separate Y.Doc and thus separate IDB transaction, regardless of the import chunk size.
// Efficency may be improved by introducing parallelism.
// Chunk sizes of 5, 20, and 500 when importing 300 thoughts result in about 15s, 12s, and 10s import time, respectively.
const CHUNK_SIZE = 20

/** Generate the IDB key for a ResumeImport file. */
const resumeImportKey = (id: string) => `resumeImports-${id}`

/** Action-creator for importFiles. */
const importFilesActionCreator =
  ({
    path,
    files,
    resume,
    insertBefore,
  }: {
    // files to import into the path
    // either files or resume must be set
    files?: File[]
    path: Path
    // insert the imported thoughts before the path instead of as children of the path
    // creates a new empty thought to import into
    insertBefore?: boolean
    // if true, resumes unfinished imports
    // either files or resume must be set
    resume?: boolean
  }): Thunk =>
  async (dispatch, getState) => {
    if (!files && !resume) {
      throw new Error('importFiles must specify files or resume.')
    }

    const state = getState()

    const importPath = insertBefore ? ([...parentOf(path), createId()] as Path) : path

    // insert empty import destination when importing before the path
    if (insertBefore) {
      const simplePath = simplifyPath(state, path)
      dispatch(
        createThought({
          path: rootedParentOf(state, importPath),
          value: '',
          rank: getRankBefore(state, simplePath),
          id: head(importPath),
        }),
      )
    }

    // normalize native files from drag-and-drop and resumed files stored in IDB
    const filesNormalized = files
      ? files.map(file => ({
          id: createId(),
          lastModified: file.lastModified,
          linesCompleted: 0,
          name: file.name,
          path: importPath,
          size: file.size,
          text: () => file.text(),
        }))
      : Object.values((await idb.get<Index<ResumeImport>>('resumeImports')) || []).map(resumeImport => ({
          id: resumeImport.id,
          name: resumeImport.name,
          lastModified: resumeImport.lastModified,
          linesCompleted: resumeImport.linesCompleted,
          path: resumeImport.path,
          size: resumeImport.size,
          text: async () => {
            const text = await idb.get<string>(resumeImportKey(resumeImport.id))
            if (text == null) {
              console.warn(`Resume file missing from IDB: %{resumeImport.id}`, resumeImport)
              return ''
            }
            return text
          },
        }))

    // import one file at a time
    const fileTasks = filesNormalized.map((file, i) => async () => {
      const fileProgressString = file.name + (filesNormalized.length > 1 ? ` (${i + 1}/${filesNormalized.length})` : '')

      // read
      dispatch(
        alert(`${resume ? 'Resume import of' : 'Reading'} ${fileProgressString}`, { alertType: AlertType.ImportFile }),
      )
      const text = await file.text()

      // if importing a new file, store in IDB for resume
      if (!resume) {
        dispatch(alert(`Storing ${fileProgressString}`, { alertType: AlertType.ImportFile }))
        await idb.update<Index<ResumeImport>>('resumeImports', resumeImports => {
          return {
            ...(resumeImports || {}),
            [file.id]: {
              id: file.id,
              lastModified: file.lastModified,
              linesCompleted: 0,
              name: file.name,
              path: file.path,
              size: file.size,
            },
          }
        })
        await idb.set(resumeImportKey(file.id), text)
      }

      // convert ThoughtIndices to plain text
      let exported = text
      if (text.startsWith('{')) {
        dispatch(alert(`Parsing ${fileProgressString}`, { alertType: AlertType.ImportFile }))
        const { thoughtIndex, lexemeIndex } = JSON.parse(text) as ThoughtIndices

        // normalize
        dispatch(alert(`Normalizing ${fileProgressString}`, { alertType: AlertType.ImportFile }))
        if (!Object.values(thoughtIndex)[0].childrenMap) {
          Object.entries(thoughtIndex).forEach(([id, thought]) => {
            thoughtIndex[id] = {
              ...thought,
              childrenMap: createChildrenMap(
                {
                  thoughts: {
                    lexemeIndex,
                    thoughtIndex,
                  },
                } as State,
                Object.keys((thought as any).children || {}) as ThoughtId[],
              ),
            }
          })
        }

        const stateImported = initialState()
        stateImported.thoughts.thoughtIndex = thoughtIndex
        stateImported.thoughts.lexemeIndex = lexemeIndex
        exported = exportContext(stateImported, HOME_TOKEN, 'text/plain')
      }

      // divide into chunks
      const chunks = chunkOutline(exported, { chunkSize: CHUNK_SIZE })

      // use to calculate proper chunk index (relative to the start of the file, not where import resumed)
      const chunkStartIndex = Math.floor(file.linesCompleted / CHUNK_SIZE)

      const chunkTasks = chunks.slice(chunkStartIndex).map((chunk, j) => () => {
        const chunkProgressString = Math.floor(((j + chunkStartIndex + 1) / chunks.length) * 100)
        return new Promise<void>(resolve => {
          dispatch([
            alert(`Importing ${fileProgressString}... ${chunkProgressString}%`, {
              alertType: AlertType.ImportFile,
              clearDelay: j + chunkStartIndex === chunks.length - 1 ? 5000 : undefined,
            }),
            importText({
              text: chunk,
              path: file.path,
              preventSetCursor: true,
              idbSynced: async () => {
                const linesCompleted = (chunkStartIndex + j + 1) * CHUNK_SIZE
                await idb.update<Index<ResumeImport>>('resumeImports', resumeImports => {
                  return {
                    ...(resumeImports || {}),
                    [file.id]: {
                      id: file.id,
                      lastModified: file.lastModified,
                      linesCompleted,
                      name: file.name,
                      path: file.path,
                      size: file.size,
                    },
                  }
                })

                resolve()
              },
            }),
          ])
        })
      })

      // import chunks serially
      // otherwise thoughts will get imported out of order
      await series(chunkTasks)

      // delete the ResumeImport file and manifest after all chunks are imported
      await idb.del(resumeImportKey(file.id))
      await idb.update<Index<ResumeImport>>('resumeImports', resumeImports => _.omit(resumeImports, file.id))
    })

    // import files serially
    // this could be parallelized as long as they have different import destinations
    await series(fileTasks)

    dispatch(alert(null, { alertType: AlertType.ImportFile }))
  }

export default importFilesActionCreator
