import Command from '../@types/Command'
import CommandId from '../@types/CommandId'
import Dispatch from '../@types/Dispatch'
import Path from '../@types/Path'
import SimplePath from '../@types/SimplePath'
import State from '../@types/State'
import Thought from '../@types/Thought'
import ThoughtId from '../@types/ThoughtId'
import { createThoughtActionCreator as createThought } from '../actions/createThought'
import { deleteAttributeActionCreator as deleteAttribute } from '../actions/deleteAttribute'
import { deleteThoughtActionCreator as deleteThought } from '../actions/deleteThought'
import { editThoughtActionCreator as editThought } from '../actions/editThought'
import { moveThoughtActionCreator as moveThought } from '../actions/moveThought'
import { pullActionCreator as pull } from '../actions/pull'
import { redoActionCreator as redo } from '../actions/redo'
import { setCursorActionCreator as setCursor } from '../actions/setCursor'
import { setDescendantActionCreator as setDescendant } from '../actions/setDescendant'
import { undoActionCreator as undo } from '../actions/undo'
import { HOME_TOKEN, ROOT_PARENT_ID } from '../constants'
import calculateAutofocus from '../selectors/calculateAutofocus'
import { getChildrenRanked } from '../selectors/getChildren'
import getNextRank from '../selectors/getNextRank'
import getPrevRank from '../selectors/getPrevRank'
import getRankAfter from '../selectors/getRankAfter'
import getRankBefore from '../selectors/getRankBefore'
import getThoughtById from '../selectors/getThoughtById'
import linearizeTree from '../selectors/linearizeTree'
import noteValue from '../selectors/noteValue'
import thoughtToPath from '../selectors/thoughtToPath'
import appendToPath from '../util/appendToPath'
import createId from '../util/createId'
import head from '../util/head'
import isAttribute from '../util/isAttribute'

type Position = 'first' | 'last' | 'before' | 'after'

interface CreateThoughtOptions {
  focus?: boolean
  parentId?: string | null
  position?: Position
  referenceId?: string
  value: string
}

interface DeleteThoughtOptions {
  thoughtId: string
}

interface ExecuteCommandOptions {
  commandId: string
}

interface FocusOptions {
  offset?: number
  target?: 'note' | 'thought'
  thoughtId: string | null
}

interface GetThoughtOptions {
  loadDepth?: number
  thoughtId: string
}

interface GetTreeOptions {
  includeArchived?: boolean
  includeMeta?: boolean
  load?: boolean
  maxDepth?: number
  maxNodes?: number
  rootId?: string | null
}

interface McpEditorOptions {
  commands: Command[]
  dispatch: Dispatch
  executeCommand: (commandId: CommandId) => void | Promise<void>
}

interface SearchThoughtsOptions {
  includeMeta?: boolean
  limit?: number
  match?: 'contains' | 'exact' | 'prefix'
  query: string
}

interface UpdateThoughtOptions {
  note?: string | null
  parentId?: string | null
  position?: Position
  referenceId?: string
  thoughtId: string
  value?: string
}

/** Returns a ThoughtId from the MCP wire format. */
const asThoughtId = (id: string): ThoughtId => id as ThoughtId

/** Throws an actionable error if a thought cannot be found. */
const requireThought = (state: State, id: ThoughtId): Thought => {
  const thought = getThoughtById(state, id)
  if (!thought) throw new Error(`Thought "${id}" was not found in the loaded thoughtspace.`)
  return thought
}

/** Resolves the MCP root alias to em's physical home thought. */
const resolveParentId = (parentId: string | null | undefined): ThoughtId =>
  parentId == null ? HOME_TOKEN : asThoughtId(parentId)

/** Returns the physical path of a thought, throwing when its ancestry is incomplete. */
const requirePath = (state: State, thoughtId: ThoughtId): SimplePath => {
  requireThought(state, thoughtId)
  const path = thoughtToPath(state, thoughtId)
  if (thoughtId !== HOME_TOKEN && path.length === 1 && head(path) === HOME_TOKEN) {
    throw new Error(`The ancestry of thought "${thoughtId}" is not loaded.`)
  }
  return path
}

/** Returns the values along a physical or display path. */
const pathValues = (state: State, path: Path): string[] =>
  path.map(id => getThoughtById(state, id)?.value ?? `[missing:${id}]`)

/** Serializes a physical thought and its immediate hierarchy for MCP clients. */
const serializeThought = (state: State, thought: Thought) => {
  const path = thoughtToPath(state, thought.id)
  const children = getChildrenRanked(state, thought.id)
  return {
    archived: thought.archived ?? null,
    autofocus: thought.id === HOME_TOKEN ? 'show' : calculateAutofocus(state, path),
    childIds: children.map(child => child.id),
    created: thought.created,
    id: thought.id,
    isMeta: isAttribute(thought.value),
    lastUpdated: thought.lastUpdated,
    note: thought.id === HOME_TOKEN ? null : noteValue(state, path),
    parentId: thought.parentId === ROOT_PARENT_ID ? null : thought.parentId,
    path,
    pathValues: pathValues(state, path),
    pending: !!thought.pending,
    rank: thought.rank,
    value: thought.value,
  }
}

type SerializedTreeThought = ReturnType<typeof serializeThought> & {
  children: SerializedTreeThought[]
  cycle?: boolean
}

/** Serializes focus and caret state. */
const serializeFocus = (state: State) =>
  state.cursor
    ? {
        noteFocus: state.noteFocus,
        noteOffset: state.noteOffset,
        offset: state.cursorOffset,
        path: state.cursor,
        pathValues: pathValues(state, state.cursor),
        thoughtId: head(state.cursor),
      }
    : null

/** Serializes the thoughts that are actually rendered after expansion and autofocus are applied. */
const serializeVisibleThoughts = (state: State) => {
  const linearized = linearizeTree(state)
  const rendered = linearized.filter(node => node.autofocus === 'show' || node.autofocus === 'dim')
  return {
    hiddenByAutofocus: linearized.length - rendered.length,
    thoughts: rendered.map(node => {
      const thought = requireThought(state, node.thoughtId)
      return {
        ...serializeThought(state, thought),
        autofocus: node.autofocus,
        contextView: !!node.showContexts,
        depth: node.depth,
        displayPath: node.path,
        displayPathValues: pathValues(state, node.path),
        focused: node.isCursor,
      }
    }),
  }
}

/** Serializes the live editor viewport and the state that affects agent interactions. */
const serializeEditorState = (state: State) => {
  const visible = serializeVisibleThoughts(state)
  return {
    focus: serializeFocus(state),
    hiddenByAutofocus: visible.hiddenByAutofocus,
    isLoading: state.isLoading,
    modal: state.showModal ?? null,
    redoAvailable: state.redoPatches.length > 0,
    rootId: HOME_TOKEN,
    search: state.search,
    status: state.status,
    undoAvailable: state.undoPatches.length > 0,
    visibleThoughts: visible.thoughts,
  }
}

/** Returns true if a thought is nested within the possible ancestor. */
const isDescendantOf = (
  state: State,
  thoughtId: ThoughtId,
  possibleAncestorId: ThoughtId,
  visited: Set<ThoughtId> = new Set(),
): boolean => {
  if (visited.has(thoughtId)) return false
  const thought = getThoughtById(state, thoughtId)
  const visitedNew = new Set([...visited, thoughtId])
  return !!thought && thought.parentId !== ROOT_PARENT_ID
    ? thought.parentId === possibleAncestorId || isDescendantOf(state, thought.parentId, possibleAncestorId, visitedNew)
    : false
}

/** Validates an optional sibling reference and returns its path. */
const requireReferencePath = (
  state: State,
  parentId: ThoughtId,
  position: Position,
  referenceId?: string,
): SimplePath | null => {
  if (position !== 'before' && position !== 'after') return null
  if (!referenceId) throw new Error(`referenceId is required when position is "${position}".`)
  const reference = requireThought(state, asThoughtId(referenceId))
  if (reference.parentId !== parentId) {
    throw new Error(`Reference thought "${referenceId}" is not a child of destination parent "${parentId}".`)
  }
  return requirePath(state, reference.id)
}

/** Calculates a rank for a requested sibling position. */
const rankForPosition = (
  state: State,
  parentId: ThoughtId,
  position: Position = 'last',
  referenceId?: string,
): number => {
  const referencePath = requireReferencePath(state, parentId, position, referenceId)
  return position === 'first'
    ? getPrevRank(state, parentId)
    : position === 'before'
      ? getRankBefore(state, referencePath!)
      : position === 'after'
        ? getRankAfter(state, referencePath!)
        : getNextRank(state, parentId)
}

/** Rejects duplicate attributes that would overwrite an existing childrenMap entry. */
const validateAttributeUniqueness = (state: State, parentId: ThoughtId, value: string, staleId?: ThoughtId): void => {
  const duplicate = isAttribute(value)
    ? getChildrenRanked(state, parentId).find(child => child.id !== staleId && child.value === value)
    : null
  if (duplicate) {
    throw new Error(`Parent "${parentId}" already contains the meta thought "${value}" (${duplicate.id}).`)
  }
}

/** Creates the browser-side editor controller used by the stdio MCP server. */
const createMcpEditor = ({ commands, dispatch, executeCommand }: McpEditorOptions) => {
  /** Reads fresh Redux state without importing the global app store. */
  const withState = <T>(selector: (state: State) => T): T => dispatch((_, getState) => selector(getState()))

  /** Returns the current editor viewport after autofocus and expansion. */
  const getEditorState = () => withState(serializeEditorState)

  /** Loads and returns one thought with its path, parent, children, and note. */
  const getThought = async ({ loadDepth = 1, thoughtId }: GetThoughtOptions) => {
    const id = asThoughtId(thoughtId)
    if (loadDepth > 0) await dispatch(pull([id], { maxDepth: loadDepth }))
    return withState(state => serializeThought(state, requireThought(state, id)))
  }

  /** Loads and returns a bounded nested physical subtree. */
  const getTree = async ({
    includeArchived = false,
    includeMeta = false,
    load = true,
    maxDepth = 4,
    maxNodes = 500,
    rootId,
  }: GetTreeOptions = {}) => {
    const id = resolveParentId(rootId)
    if (load) await dispatch(pull([id], { maxDepth }))

    return withState(state => {
      const root = requireThought(state, id)
      const traversal = { count: 0, truncated: false }

      /** Recursively serializes a bounded subtree while guarding against corrupt cycles. */
      const visit = (thought: Thought, depth: number, ancestors: Set<ThoughtId>): SerializedTreeThought => {
        traversal.count += 1
        const childrenAll = getChildrenRanked(state, thought.id)
        const childrenFiltered = childrenAll.filter(
          child =>
            (includeMeta || !isAttribute(child.value)) &&
            (includeArchived || (child.value !== '=archive' && !child.archived)),
        )
        if (depth >= maxDepth) {
          traversal.truncated = traversal.truncated || childrenFiltered.length > 0
          return { ...serializeThought(state, thought), children: [] }
        }

        const ancestorsNew = new Set([...ancestors, thought.id])
        const children = childrenFiltered.reduce<SerializedTreeThought[]>((accum, child) => {
          if (traversal.count >= maxNodes) {
            traversal.truncated = true
            return accum
          }
          if (ancestorsNew.has(child.id)) {
            traversal.truncated = true
            return [...accum, { ...serializeThought(state, child), children: [], cycle: true }]
          }
          return [...accum, visit(child, depth + 1, ancestorsNew)]
        }, [])
        return { ...serializeThought(state, thought), children }
      }

      const rootSerialized = visit(root, 0, new Set())
      return {
        maxDepth,
        maxNodes,
        nodeCount: Math.min(traversal.count, maxNodes),
        root: rootSerialized,
        truncated: traversal.truncated,
      }
    })
  }

  /** Searches thoughts currently loaded into the editor and returns unambiguous IDs and paths. */
  const searchThoughts = ({ includeMeta = false, limit = 50, match = 'contains', query }: SearchThoughtsOptions) =>
    withState(state => {
      const queryNormalized = query.toLocaleLowerCase()
      /** Matches a thought value using the requested strategy. */
      const matches = (value: string) => {
        const valueNormalized = value.toLocaleLowerCase()
        return match === 'exact'
          ? valueNormalized === queryNormalized
          : match === 'prefix'
            ? valueNormalized.startsWith(queryNormalized)
            : valueNormalized.includes(queryNormalized)
      }
      const results = Object.values(state.thoughts.thoughtIndex)
        .filter(
          thought =>
            thought.id !== HOME_TOKEN && (includeMeta || !isAttribute(thought.value)) && matches(thought.value),
        )
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .slice(0, limit)
        .map(thought => serializeThought(state, thought))
      return { loadedThoughtCount: Object.keys(state.thoughts.thoughtIndex).length, results }
    })

  /** Moves focus to a thought, or clears focus when thoughtId is null. */
  const setFocus = ({ offset, target = 'thought', thoughtId }: FocusOptions) =>
    withState(state => {
      const path = thoughtId == null ? null : requirePath(state, asThoughtId(thoughtId))
      if (target === 'note' && (!path || noteValue(state, path) === null)) {
        throw new Error('Cannot focus a missing note. Set the note with update_thought first.')
      }
      dispatch(
        setCursor({
          noteFocus: target === 'note',
          noteOffset: target === 'note' ? (offset ?? null) : null,
          offset: target === 'thought' ? offset : undefined,
          path: thoughtId === HOME_TOKEN ? null : path,
        }),
      )
      return serializeFocus(withState(stateNew => stateNew))
    })

  /** Creates a thought under an explicit parent with a stable returned ID. */
  const createThoughtInEditor = ({
    focus = false,
    parentId,
    position = 'last',
    referenceId,
    value,
  }: CreateThoughtOptions) =>
    withState(state => {
      const parent = resolveParentId(parentId)
      requireThought(state, parent)
      validateAttributeUniqueness(state, parent, value)
      const id = createId()
      const rank = rankForPosition(state, parent, position, referenceId)
      const parentPath = requirePath(state, parent)
      dispatch(createThought({ id, path: parentPath, rank, value }))
      if (focus) dispatch(setCursor({ offset: value.length, path: appendToPath(parentPath, id) }))
      const stateNew = withState(stateAfterCreate => stateAfterCreate)
      return serializeThought(stateNew, requireThought(stateNew, id))
    })

  /** Edits, moves, reorders, and/or updates the note of an existing thought. */
  const updateThoughtInEditor = ({ note, parentId, position, referenceId, thoughtId, value }: UpdateThoughtOptions) =>
    withState(state => {
      const id = asThoughtId(thoughtId)
      const thought = requireThought(state, id)
      if (id === HOME_TOKEN) throw new Error('The home root cannot be updated.')

      const destinationId = parentId !== undefined ? resolveParentId(parentId) : (thought.parentId as ThoughtId)
      requireThought(state, destinationId)
      if (destinationId === id || isDescendantOf(state, destinationId, id)) {
        throw new Error(`Thought "${id}" cannot be moved into itself or one of its descendants.`)
      }
      if (referenceId === thoughtId) throw new Error('A thought cannot be positioned relative to itself.')

      const valueNew = value ?? thought.value
      validateAttributeUniqueness(state, destinationId, valueNew, id)

      if (value !== undefined && value !== thought.value) {
        dispatch(
          editThought({
            newValue: value,
            oldValue: thought.value,
            path: requirePath(state, id),
          }),
        )
      }

      const stateAfterEdit = withState(stateNew => stateNew)
      const thoughtAfterEdit = requireThought(stateAfterEdit, id)
      const shouldMove = parentId !== undefined || position !== undefined
      if (shouldMove) {
        const rank = rankForPosition(stateAfterEdit, destinationId, position ?? 'last', referenceId)
        const oldPath = requirePath(stateAfterEdit, id)
        const destinationPath = requirePath(stateAfterEdit, destinationId)
        dispatch(
          moveThought({
            newPath: appendToPath(destinationPath, id),
            newRank: rank,
            oldPath,
            skipMerge: true,
          }),
        )
      }

      if (note !== undefined) {
        const stateAfterMove = withState(stateNew => stateNew)
        const path = requirePath(stateAfterMove, id)
        dispatch(
          note === null ? deleteAttribute({ path, value: '=note' }) : setDescendant({ path, values: ['=note', note] }),
        )
      }

      const stateNew = withState(stateAfterUpdate => stateAfterUpdate)
      return serializeThought(stateNew, requireThought(stateNew, thoughtAfterEdit.id))
    })

  /** Recursively deletes a thought and returns the editor focus selected by em. */
  const deleteThoughtInEditor = ({ thoughtId }: DeleteThoughtOptions) =>
    withState(state => {
      const id = asThoughtId(thoughtId)
      const thought = requireThought(state, id)
      if (id === HOME_TOKEN || thought.parentId === ROOT_PARENT_ID) {
        throw new Error('Root thoughts cannot be deleted.')
      }
      const path = requirePath(state, id)
      dispatch(deleteThought({ pathParent: path.slice(0, -1) as Path, thoughtId: id }))
      return {
        deletedId: id,
        focus: serializeFocus(withState(stateNew => stateNew)),
      }
    })

  /** Lists user-facing editor commands and whether they can run in the current state. */
  const listCommands = () =>
    withState(state => ({
      commands: commands.map(command => {
        const active = !!command.isActive?.(state)
        const description =
          typeof command.description === 'function' ? command.description(state) : (command.description ?? null)
        return {
          active,
          canExecute: !command.canExecute || command.canExecute(state),
          description,
          id: command.id,
          label: active && command.labelInverse ? command.labelInverse : command.label,
        }
      }),
    }))

  /** Executes any user-facing command against the current editor focus. */
  const executeEditorCommand = async ({ commandId }: ExecuteCommandOptions) => {
    const command = commands.find(candidate => candidate.id === commandId)
    if (!command) throw new Error(`Unknown command "${commandId}". Call list_commands for valid command IDs.`)
    const state = withState(stateCurrent => stateCurrent)
    if (command.canExecute && !command.canExecute(state)) {
      throw new Error(`Command "${commandId}" cannot execute in the current editor state.`)
    }
    await executeCommand(command.id)
    return getEditorState()
  }

  /** Undoes the most recent editor mutation. */
  const undoEditor = () => {
    const available = withState(state => state.undoPatches.length > 0)
    if (!available) throw new Error('There is no editor mutation to undo.')
    dispatch(undo())
    return getEditorState()
  }

  /** Redoes the most recently undone editor mutation. */
  const redoEditor = () => {
    const available = withState(state => state.redoPatches.length > 0)
    if (!available) throw new Error('There is no editor mutation to redo.')
    dispatch(redo())
    return getEditorState()
  }

  return {
    createThought: createThoughtInEditor,
    deleteThought: deleteThoughtInEditor,
    executeCommand: executeEditorCommand,
    getEditorState,
    getThought,
    getTree,
    listCommands,
    redo: redoEditor,
    searchThoughts,
    setFocus,
    undo: undoEditor,
    updateThought: updateThoughtInEditor,
  }
}

export default createMcpEditor
