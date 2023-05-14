import * as idb from 'idb-keyval'
import _ from 'lodash'
import sanitize from 'sanitize-html'
import Context from '../@types/Context'
import Index from '../@types/IndexType'
import Path from '../@types/Path'
import State from '../@types/State'
import ThoughtId from '../@types/ThoughtId'
import ThoughtIndices from '../@types/ThoughtIndices'
import Thunk from '../@types/Thunk'
import deleteThought from '../action-creators/deleteThought'
import newThought from '../action-creators/newThought'
import setCursor from '../action-creators/setCursor'
import { ALLOWED_ATTRIBUTES, ALLOWED_TAGS, AlertType, HOME_PATH, HOME_TOKEN } from '../constants'
import globals from '../globals'
import contextToPath from '../selectors/contextToPath'
import { exportContext } from '../selectors/exportContext'
import findDescendant from '../selectors/findDescendant'
import { anyChild, findAnyChild } from '../selectors/getChildren'
import getThoughtById from '../selectors/getThoughtById'
import isPending from '../selectors/isPending'
import nextSibling from '../selectors/nextSibling'
import rootedParentOf from '../selectors/rootedParentOf'
import syncStatusStore from '../stores/syncStatus'
import appendToPath from '../util/appendToPath'
import createChildrenMap from '../util/createChildrenMap'
import createId from '../util/createId'
import head from '../util/head'
import htmlToJson from '../util/htmlToJson'
import initialState from '../util/initialState'
import mapBlocks from '../util/mapBlocks'
import numBlocks from '../util/numBlocks'
import parentOf from '../util/parentOf'
import pathToContext from '../util/pathToContext'
import series from '../util/series'
import textToHtml from '../util/textToHtml'
import unroot from '../util/unroot'
import alert from './alert'
import pull from './pull'

/** Represents a file that is imported with drag-and-drop. Unifies imports from the File API and Clipboard. */
interface VirtualFile {
  lastModified: number
  name: string
  size: number
  text: () => Promise<string>
}

/** Meta information for a file import that is stored in IDB and automatically resumed on initialize. */
interface ResumeImport {
  /** Unique id for the import.
      importing the same file a second time will generate a new ResumeImport with a new id. */
  id: string
  /** Insert the imported thoughts before the path instead of as children of the path. Creates a new empty thought to import into. */
  insertBefore?: boolean
  lastModified: number
  /** Number of thoughts that have already been imported. */
  thoughtsImported: number
  name: string
  /** Import destination path. */
  path: Path
  size: number
}

type ResumableFile = VirtualFile & ResumeImport

/** Creates a small object that can be used to manage the persistence of a ResumableFile. */
const resumeImportsManager = (file: ResumableFile) => {
  /** Initializes the ResumeImport file manifest and raw file in IDB. */
  const init = async (text: string) => {
    await update(file.path, 0, file.insertBefore)
    await idb.set(resumeImportKey(file.id), text)
  }

  /** Deletes the ResumeImport file manifest and raw file in IDB. */
  const del = async () => {
    globals.lastImportedPath = undefined
    await idb.del(resumeImportKey(file.id))
    await idb.update<Index<ResumeImport>>('resumeImports', resumeImports => _.omit(resumeImports, file.id))
  }

  /** Updates the persisted ResumeImport file to the latest number of imported thoughts. */
  // TODO: throttling update breaks resume file.path for some reason
  const update = async (path: Path | null, thoughtsImported: number, insertBefore?: boolean) =>
    idb.update<Index<ResumeImport>>('resumeImports', resumeImports => {
      return {
        ...(resumeImports || {}),
        [file.id]: {
          id: file.id,
          // use the original insertBefore for the first import of the first thought
          // See: insertBeforeNew
          insertBefore: thoughtsImported === 1 ? insertBefore : file.insertBefore,
          lastModified: file.lastModified,
          thoughtsImported,
          name: file.name,
          path: path || file.path,
          size: file.size,
        },
      }
    })

  return { del, init, update }
}

/** Generate the IDB key for a ResumeImport file. */
const resumeImportKey = (id: string) => `resumeImports-${id}`

/** Pulls the thoughts in the given context if they exist. */
const pullDuplicateDescendants =
  (id: ThoughtId, context: Context): Thunk =>
  async (dispatch, getState) => {
    if (context.length === 0) return

    // if thought is pending, pull it
    if (isPending(getState(), getThoughtById(getState(), id))) {
      // Must be forced, otherwise thoughts can be missed.
      // (Not sure how, since pull calls getPendingDescentants, which should be the same.)
      await dispatch(pull([id], { force: true, maxDepth: 1 }))
    }

    // if there is a duplicate, recurse
    const duplicate = findDescendant(getState(), id, context[0])
    if (duplicate) {
      await dispatch(pullDuplicateDescendants(duplicate, context.slice(1)))
    }
  }

/** Action-creator for importFiles. */
const importFilesActionCreator =
  ({
    files,
    insertBefore,
    path,
    resume,
  }: {
    /** Files to import into the path. Either files or resume must be set. */
    files?: VirtualFile[]
    /** Insert the imported thoughts before the path instead of as children of the path. Creates a new empty thought to import into. */
    insertBefore?: boolean
    /** Import destination path. Ignored during resume import, where the path is stored in the ResumeImport manifest. */
    path?: Path
    /** If true, resumes unfinished imports. Either files or resume must be set. */
    resume?: boolean
  }): Thunk =>
  async (dispatch, getState) => {
    if (!files && !resume) {
      throw new Error('importFiles must specify files or resume.')
    }

    // allow aborting the import if there is an error
    let abort = false
    const state = getState()
    const importPath = path || HOME_PATH

    // if the destination thought is empty, then it will get destroyed by importText, so we need to calculate a new insertBefore and path for subsequent thoughts
    // these will be saved to the ResumableFile but ignored on the first thought
    const destThought = getThoughtById(state, head(importPath))
    const destIsLeaf = !anyChild(state, head(importPath))
    const destEmpty = destThought.value === '' && destIsLeaf
    const siblingAfter = destEmpty ? nextSibling(state, importPath) : null
    const insertBeforeNew = destEmpty && !!siblingAfter
    const pathNew = destEmpty
      ? siblingAfter
        ? appendToPath(parentOf(importPath), siblingAfter.id)
        : rootedParentOf(state, importPath)
      : importPath

    // normalize native files from drag-and-drop and resumed files stored in IDB
    const resumableFiles: ResumableFile[] = files
      ? files.map(file => {
          return {
            id: createId(),
            insertBefore: insertBeforeNew,
            lastModified: file.lastModified,
            thoughtsImported: 0,
            name: file.name,
            path: pathNew,
            size: file.size,
            text: () => file.text(),
          }
        })
      : Object.values((await idb.get<Index<ResumeImport>>('resumeImports')) || []).map(resumeImport => ({
          id: resumeImport.id,
          insertBefore: resumeImport.insertBefore,
          lastModified: resumeImport.lastModified,
          thoughtsImported: resumeImport.thoughtsImported,
          name: resumeImport.name,
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
    const fileTasks = resumableFiles.map((file, i) => async () => {
      const manager = resumeImportsManager(file)
      const fileProgressString = file.name + (resumableFiles.length > 1 ? ` (${i + 1}/${resumableFiles.length})` : '')

      // read file
      dispatch(
        alert(`${resume ? 'Resume import of' : 'Reading'} ${fileProgressString}`, { alertType: AlertType.ImportFile }),
      )
      const text = await file.text()

      // if importing a new file, initialize resumeImports in IDB as soon as possible
      if (!resume) {
        dispatch(alert(`Storing ${fileProgressString}`, { alertType: AlertType.ImportFile }))
        manager.init(text)
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

      const html = textToHtml(exported)

      // Close incomplete tags, preserve only allowed tags and attributes and decode the html.
      const htmlSanitized = unescape(
        sanitize(html, {
          allowedTags: ALLOWED_TAGS,
          allowedAttributes: ALLOWED_ATTRIBUTES,
          disallowedTagsMode: 'recursiveEscape',
        }),
      )
      const json = htmlToJson(htmlSanitized)
      const numThoughts = numBlocks(json)

      syncStatusStore.update({ importProgress: 0 / numThoughts })
      dispatch(alert(`Importing ${fileProgressString}...`, { alertType: AlertType.ImportFile }))

      const importTasks = mapBlocks(
        json,
        (block, ancestors, i) => async (): Promise<void> => {
          // cannot properly short circuit mapBlocks, so just discontinue all remaining iterations
          if (abort) return

          let state = getState()
          const path = resume ? file.path : ancestors.length === 0 ? importPath : pathNew
          // get the context relative to the import root
          // the relative context is appended to the base context to get the destination context
          const relativeAncestorContext = ancestors.map(block => block.scope)

          // must replicate descendants before calculating baseContext and parentContext
          await dispatch(pullDuplicateDescendants(head(path), [...relativeAncestorContext, block.scope]))
          state = getState()

          // if inserting into an empty destination with a sibling afterwards, import into the parent
          const baseContext = pathToContext(
            state,
            insertBeforeNew
              ? rootedParentOf(state, path)
              : destEmpty && ancestors.length === 0
              ? rootedParentOf(state, path)
              : path,
          )
          const parentContext =
            ancestors.length === 0 ? baseContext : [...unroot(baseContext), ...relativeAncestorContext]
          // TODO: It would be better to get the id from importText rather than contextToPath
          const parentPath = contextToPath(state, parentContext)

          // validate parentPath
          if (!parentPath) {
            const partialPath = parentContext.map((id, i) =>
              findDescendant(state, HOME_TOKEN, parentContext.slice(0, i + 1)),
            )
            const errorMessage = `Error importing ${parentContext.join('/')}.`
            console.error(errorMessage, 'Missing parentPath.', {
              importPath,
              baseContext,
              parentContext,
              parentPath: partialPath,
            })

            // ask user if they want to skip the thought or cancel the import
            if (!window.confirm(`${errorMessage}\n\nSkip thought?`)) {
              abort = true
              await manager.del()
            }
            return
          }

          // import into parent path after empty destination thought is destroyed
          const importThoughtPath = ancestors.length === 0 && insertBeforeNew ? pathNew : parentPath

          const duplicate = findAnyChild(state, head(parentPath), child => child.value === block.scope)

          return new Promise<void>(resolve => {
            /** Updates importProgress alert and resumeImports. */
            const updateImportProgress = async () => {
              // update resumeImports with thoughtsImported
              const importProgress = (i + 1) / numThoughts
              const importProgressString = (Math.round(importProgress * 1000) / 10).toFixed(1)
              syncStatusStore.update({ importProgress })
              dispatch(
                alert(`Importing ${fileProgressString}... ${importProgressString}%`, {
                  alertType: AlertType.ImportFile,
                  clearDelay: i === numThoughts - 1 ? 5000 : undefined,
                }),
              )

              const resumePath =
                i === 0 ? contextToPath(getState(), unroot([...parentContext, block.scope]))! : file.path
              await manager.update(resumePath, i + 1)
            }

            dispatch([
              // delete empty destination thought
              i === 0 && destEmpty ? deleteThought({ pathParent: parentPath, thoughtId: head(importPath) }) : null,
              // If the thought is a duplicate, immediately update the import progress and resolve the task.
              // Otherwise insert the new thought.
              duplicate
                ? () => {
                    updateImportProgress().then(resolve)
                  }
                : newThought({
                    at: importThoughtPath,
                    insertNewSubthought: ancestors.length > 0 || !insertBeforeNew,
                    insertBefore: ancestors.length === 0 && insertBeforeNew,
                    preventSetCursor: true,
                    value: block.scope,
                    idbSynced: () => {
                      updateImportProgress().then(resolve)
                    },
                  }),
              // set cursor to new thought on the first iteration
              // ensure the last imported thought is not deleted by freeThoughts
              (dispatch, getState) => {
                const state = getState()
                const cursorNew = contextToPath(state, unroot([...parentContext, block.scope]))

                // update the lastImportedPath so it can be protected from freeThoughts during import
                if (cursorNew) {
                  globals.lastImportedPath = cursorNew
                }

                // set cursor to first imported thought
                if (i === 0) {
                  dispatch(setCursor({ path: cursorNew }))
                }
              },
            ])
          })
        },
        { start: file.thoughtsImported },
      )

      // import thoughts serially
      // otherwise thoughts will get imported out of order
      await series(importTasks)
      await manager.del()
    })

    // import files serially
    // this could be parallelized as long as they have different import destinations
    await series(fileTasks)

    dispatch(alert(null, { alertType: AlertType.ImportFile }))
  }

export default importFilesActionCreator
