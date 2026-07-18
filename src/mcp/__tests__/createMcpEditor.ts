import Command from '../../@types/Command'
import { importTextActionCreator as importText } from '../../actions/importText'
import store from '../../stores/app'
import contextToThought from '../../test-helpers/contextToThought'
import initStore from '../../test-helpers/initStore'
import { setCursorFirstMatchActionCreator as setCursor } from '../../test-helpers/setCursorFirstMatch'
import createMcpEditor from '../createMcpEditor'

/** Creates an isolated MCP controller around the test store. */
const createEditor = (commands: Command[] = [], executeCommand = vi.fn()) =>
  createMcpEditor({
    commands,
    dispatch: store.dispatch,
    executeCommand,
  })

beforeEach(initStore)

it('returns only thoughts rendered after autofocus', () => {
  store.dispatch(
    importText({
      text: `
        - a
          - b
            - c
              - d
    `,
    }),
  )
  store.dispatch(setCursor(['a', 'b', 'c']))

  const editor = createEditor()
  const state = editor.getEditorState()

  expect(state.focus?.pathValues).toEqual(['a', 'b', 'c'])
  expect(state.visibleThoughts.map(thought => thought.value)).toEqual(['b', 'c', 'd'])
  expect(state.visibleThoughts.map(thought => thought.autofocus)).toEqual(['dim', 'show', 'show'])
  expect(state.hiddenByAutofocus).toBe(1)
})

it('creates, edits, annotates, moves, focuses, and recursively deletes thoughts', async () => {
  store.dispatch(importText({ text: '- parent\n- destination' }))
  const editor = createEditor()
  const parent = contextToThought(store.getState(), ['parent'])!
  const destination = contextToThought(store.getState(), ['destination'])!

  const created = editor.createThought({
    focus: true,
    parentId: parent.id,
    value: 'child',
  })
  expect(created.value).toBe('child')
  expect(created.parentId).toBe(parent.id)
  expect(editor.getEditorState().focus?.thoughtId).toBe(created.id)

  const updated = editor.updateThought({
    note: 'agent note',
    parentId: destination.id,
    thoughtId: created.id,
    value: 'child edited',
  })
  expect(updated.value).toBe('child edited')
  expect(updated.note).toBe('agent note')
  expect(updated.parentId).toBe(destination.id)
  expect(updated.pathValues).toEqual(['destination', 'child edited'])

  expect((await editor.getThought({ loadDepth: 0, thoughtId: created.id })).id).toBe(created.id)

  editor.setFocus({ offset: 3, target: 'note', thoughtId: created.id })
  expect(editor.getEditorState().focus).toMatchObject({
    noteFocus: true,
    noteOffset: 3,
    thoughtId: created.id,
  })

  editor.setFocus({ offset: 2, thoughtId: created.id })
  expect(editor.getEditorState().focus).toMatchObject({ offset: 2, thoughtId: created.id })

  const tree = await editor.getTree({ includeMeta: false, load: false })
  expect(tree.root.children).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        value: 'destination',
        children: [expect.objectContaining({ id: created.id, value: 'child edited' })],
      }),
    ]),
  )

  editor.deleteThought({ thoughtId: destination.id })
  expect(editor.searchThoughts({ match: 'exact', query: 'child edited' }).results).toEqual([])
  expect(editor.getEditorState().focus).toBe(null)
})

it('supports exact sibling placement and reordering', () => {
  const editor = createEditor()
  const a = editor.createThought({ value: 'a' })
  const c = editor.createThought({ value: 'c' })
  const b = editor.createThought({ position: 'before', referenceId: c.id, value: 'b' })

  /** Returns the rendered values at the home level. */
  const rootValues = () =>
    editor
      .getEditorState()
      .visibleThoughts.filter(thought => thought.depth === 0)
      .map(thought => thought.value)

  expect(rootValues()).toEqual(['a', 'b', 'c'])

  editor.updateThought({ position: 'after', referenceId: c.id, thoughtId: a.id })
  expect(rootValues()).toEqual(['b', 'c', 'a'])
  expect(b.parentId).toBe(a.parentId)
})

it('bounds hierarchy reads and excludes meta thoughts by default', async () => {
  store.dispatch(
    importText({
      text: `
        - a
          - b
            - c
          - =note
            - hidden metadata
    `,
    }),
  )
  const editor = createEditor()

  const shallow = await editor.getTree({ includeMeta: false, load: false, maxDepth: 1 })
  const a = shallow.root.children[0]
  expect(shallow.truncated).toBe(true)
  expect(a.children).toEqual([])

  const withMeta = await editor.getTree({ includeMeta: true, load: false, maxDepth: 3 })
  expect(withMeta.root.children[0].children.map(child => child.value)).toEqual(['b', '=note'])
})

it('lists and executes the complete injected command surface', async () => {
  const executeCommand = vi.fn()
  const command = {
    id: 'home',
    label: 'Home',
    multicursor: false,
    description: 'Go home.',
    canExecute: () => true,
    exec: vi.fn(),
  } as unknown as Command
  const editor = createEditor([command], executeCommand)

  expect(editor.listCommands().commands).toEqual([
    {
      active: false,
      canExecute: true,
      description: 'Go home.',
      id: 'home',
      label: 'Home',
    },
  ])

  await editor.executeCommand({ commandId: 'home' })
  expect(executeCommand).toHaveBeenCalledWith('home')
})

it('undoes and redoes MCP mutations', () => {
  const editor = createEditor()
  editor.createThought({ value: 'reversible' })
  expect(editor.searchThoughts({ match: 'exact', query: 'reversible' }).results).toHaveLength(1)

  editor.undo()
  expect(editor.searchThoughts({ match: 'exact', query: 'reversible' }).results).toHaveLength(0)

  editor.redo()
  expect(editor.searchThoughts({ match: 'exact', query: 'reversible' }).results).toHaveLength(1)
})
