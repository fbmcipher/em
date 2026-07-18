import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import puppeteer, { Browser, Page } from 'puppeteer'
import { z } from 'zod/v4'

const browserUrl = process.env.EM_MCP_BROWSER_URL ?? process.env.EM_BRIDGE_BROWSER_URL ?? 'http://127.0.0.1:9222'
const urlMatch = process.env.EM_MCP_URL_MATCH ?? process.env.EM_BRIDGE_URL_MATCH ?? 'localhost:3000'

/** A CDP connection to the visible em tab shared with the user and other browser tooling. */
class EditorConnection {
  private browser: Browser | null = null
  private page: Page | null = null

  /** Connects to Chrome if needed and selects the configured em tab. */
  private async getPage(): Promise<Page> {
    if (this.page && !this.page.isClosed()) return this.page

    if (!this.browser?.connected) {
      try {
        this.browser = await puppeteer.connect({ browserURL: browserUrl })
      } catch (error) {
        throw new Error(
          `Could not connect to Chrome at ${browserUrl}. Start it with "yarn mcp:chrome" before using the em MCP server. ${error instanceof Error ? error.message : String(error)}`,
        )
      }
      this.browser.once('disconnected', () => {
        this.browser = null
        this.page = null
      })
    }

    const pages = await this.browser.pages()
    const page = pages.find(candidate => candidate.url().includes(urlMatch))
    if (!page) {
      throw new Error(
        `No em tab matching "${urlMatch}" was found at ${browserUrl}. Open the em app in the shared Chrome. Available pages: ${pages.map(candidate => candidate.url()).join(', ') || '(none)'}`,
      )
    }
    this.page = page
    return page
  }

  /** Calls one method on the in-app MCP controller and returns its serializable result. */
  async invoke<T>(method: string, args: object = {}): Promise<T> {
    const page = await this.getPage()
    await page.waitForFunction(
      () => {
        const em = window.em as { mcp?: object } | undefined
        return !!em?.mcp
      },
      { timeout: 10_000 },
    )
    return page.evaluate(
      async (methodName, methodArgs) => {
        const em = window.em as
          | {
              mcp?: Record<string, (args: object) => unknown | Promise<unknown>>
            }
          | undefined
        const fn = em?.mcp?.[methodName]
        if (!fn) throw new Error(`The em tab does not provide MCP method "${methodName}".`)
        return fn(methodArgs)
      },
      method,
      args,
    ) as Promise<T>
  }

  /** Disconnects this MCP process without closing the user's shared browser. */
  async close(): Promise<void> {
    await this.browser?.disconnect()
    this.browser = null
    this.page = null
  }
}

const connection = new EditorConnection()

/** Converts a serializable editor response into both text and structured MCP content. */
const result = (value: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  structuredContent: value,
})

const server = new McpServer(
  {
    name: 'em-thoughtspace',
    version: '1.0.0',
  },
  {
    instructions:
      'Use get_editor_state first. Address thoughts by their stable id, not by display text. visibleThoughts are already filtered to what is rendered after expansion and autofocus; use get_tree or get_thought for physical hierarchy outside the viewport. Mutations are applied to the live editor and participate in normal em persistence and undo.',
  },
)

server.registerTool(
  'get_editor_state',
  {
    description:
      'Get the live editor focus, caret/note focus, status, and visible thoughts in rendered order. Thoughts hidden by autofocus are excluded; shown and dimmed thoughts include their autofocus status, depth, physical hierarchy, and display path.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => result(await connection.invoke('getEditorState')),
)

server.registerTool(
  'get_thought',
  {
    description:
      'Get one thought by stable id, including its physical parent, ordered child ids, full id/value path, note, rank, timestamps, and current autofocus status. Optionally loads descendants from local thoughtspace storage first.',
    inputSchema: z.object({
      loadDepth: z.number().int().min(0).max(100).default(1).describe('Descendant depth to load before reading.'),
      thoughtId: z.string().min(1).describe('Stable thought id returned by another em MCP tool.'),
    }),
    annotations: { readOnlyHint: true },
  },
  async args => result(await connection.invoke('getThought', args)),
)

server.registerTool(
  'get_tree',
  {
    description:
      'Get a bounded nested physical thought hierarchy. This is independent of viewport expansion and autofocus. The response reports truncation, node count, and stable ids for further traversal.',
    inputSchema: z.object({
      includeArchived: z.boolean().default(false).describe('Include archived branches and archived thoughts.'),
      includeMeta: z.boolean().default(false).describe('Include =attribute thoughts and their descendants.'),
      load: z.boolean().default(true).describe('Load the requested descendant depth from thoughtspace storage first.'),
      maxDepth: z.number().int().min(0).max(100).default(4),
      maxNodes: z.number().int().min(1).max(5000).default(500),
      rootId: z
        .string()
        .min(1)
        .nullable()
        .optional()
        .describe('Root thought id. Omit or use null for the home thoughtspace root.'),
    }),
    annotations: { readOnlyHint: true },
  },
  async args => result(await connection.invoke('getTree', args)),
)

server.registerTool(
  'search_thoughts',
  {
    description:
      'Search thoughts currently loaded in the editor by value. Returns stable ids and physical paths so duplicate text is unambiguous. Traverse with get_tree to load thoughtspace regions that are not loaded yet.',
    inputSchema: z.object({
      includeMeta: z.boolean().default(false),
      limit: z.number().int().min(1).max(500).default(50),
      match: z.enum(['contains', 'exact', 'prefix']).default('contains'),
      query: z.string(),
    }),
    annotations: { readOnlyHint: true },
  },
  async args => result(await connection.invoke('searchThoughts', args)),
)

server.registerTool(
  'set_focus',
  {
    description:
      'Move the live editor focus/caret to a thought or its note by stable id. Use null to clear focus and show the home level. Returns the resulting focus.',
    inputSchema: z.object({
      offset: z.number().int().min(0).optional().describe('Optional caret character offset within the target.'),
      target: z.enum(['thought', 'note']).default('thought'),
      thoughtId: z.string().min(1).nullable(),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async args => result(await connection.invoke('setFocus', args)),
)

server.registerTool(
  'create_thought',
  {
    description:
      'Create a thought in the live editor under a physical parent. Omit parentId or use null for home. Use before/after with referenceId for exact sibling placement. Returns the new stable id and hierarchy.',
    inputSchema: z.object({
      focus: z.boolean().default(false).describe('Focus the newly created thought.'),
      parentId: z.string().min(1).nullable().optional().describe('Physical parent id; null or omitted means home.'),
      position: z.enum(['first', 'last', 'before', 'after']).default('last'),
      referenceId: z.string().min(1).optional().describe('Sibling id required for before or after.'),
      value: z.string(),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  async args => result(await connection.invoke('createThought', args)),
)

server.registerTool(
  'edit_thought',
  {
    description: 'Edit the text content of an existing thought.',
    inputSchema: z.object({
      thoughtId: z.string().min(1),
      value: z.string(),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async args => result(await connection.invoke('updateThought', args)),
)

server.registerTool(
  'update_thought',
  {
    description:
      'Update a thought in one operation: edit its value, set/delete its note, move it to another parent, and/or reorder it. Omitted fields are unchanged. parentId null means home; note null deletes the direct note.',
    inputSchema: z.object({
      note: z.string().nullable().optional(),
      parentId: z.string().min(1).nullable().optional(),
      position: z.enum(['first', 'last', 'before', 'after']).optional(),
      referenceId: z.string().min(1).optional().describe('Sibling id required for before or after.'),
      thoughtId: z.string().min(1),
      value: z.string().optional(),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async args => result(await connection.invoke('updateThought', args)),
)

server.registerTool(
  'delete_thought',
  {
    description:
      'Permanently delete a thought and its physical descendant subtree from the live editor. Returns the resulting editor focus. The mutation can be reversed with undo while it remains in undo history.',
    inputSchema: z.object({
      thoughtId: z.string().min(1),
    }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async args => result(await connection.invoke('deleteThought', args)),
)

server.registerTool(
  'list_commands',
  {
    description:
      'List every user-facing em command with its stable id, current label/active state, description, and whether it can execute now.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => result(await connection.invoke('listCommands')),
)

server.registerTool(
  'execute_command',
  {
    description:
      'Execute any user-facing em command against the current focus, including navigation, formatting, attributes, views, selection, and editor UI actions. Call list_commands first for ids and availability.',
    inputSchema: z.object({
      commandId: z.string().min(1),
    }),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async args => result(await connection.invoke('executeCommand', args)),
)

server.registerTool(
  'undo',
  {
    description: 'Undo the most recent editor mutation and return the updated visible editor state.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  async () => result(await connection.invoke('undo')),
)

server.registerTool(
  'redo',
  {
    description: 'Redo the most recently undone editor mutation and return the updated visible editor state.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  async () => result(await connection.invoke('redo')),
)

server.registerResource(
  'visible-editor',
  'em://editor/visible',
  {
    description: 'Live em editor focus and visible thoughts after autofocus.',
    mimeType: 'application/json',
  },
  async uri => {
    const editor = await connection.invoke<Record<string, unknown>>('getEditorState')
    return {
      contents: [{ mimeType: 'application/json', text: JSON.stringify(editor, null, 2), uri: uri.href }],
    }
  },
)

/** Starts the local stdio MCP transport. */
const main = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

const shutdownState = { started: false }

/** Gracefully disconnects from the shared browser and MCP client. */
const shutdown = async () => {
  if (shutdownState.started) return
  shutdownState.started = true
  await connection.close()
  await server.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.stdin.on('end', shutdown)

main().catch(error => {
  console.error('Failed to start em MCP server:', error)
  process.exit(1)
})
