# Model Context Protocol

em includes a local stdio [Model Context Protocol](https://modelcontextprotocol.io/) server that lets an agent operate the same live editor a person sees. It can read the autofocus-filtered viewport, traverse physical hierarchy, search loaded thoughts, focus the editor, perform thought CRUD and moves, manage notes, undo/redo, and execute every user-facing em command.

## Architecture

The MCP client starts [`src/mcp/server.ts`](../src/mcp/server.ts) over stdio. The server attaches to a shared Chrome through the Chrome DevTools Protocol, finds the live em tab, and calls the controller exposed at `window.em.mcp`.

The browser-side [`createMcpEditor`](../src/mcp/createMcpEditor.ts) controller dispatches normal em actions. Mutations therefore update the mounted editor immediately and use the same undo, IndexedDB, and synchronization pipeline as user input. It reads fresh state inside thunks rather than importing the global Redux store.

The server only connects to the loopback CDP endpoint by default and does not close Chrome when the MCP client exits. A Chrome remote-debugging endpoint grants control over every tab in that Chrome profile, so use the dedicated profile created by `mcp:chrome` and do not expose port 9222 to a network.

## Run locally

Install dependencies once:

```sh
yarn
```

Start the app and the dedicated headed Chrome in separate terminals:

```sh
yarn start
yarn mcp:chrome
```

`mcp:chrome` opens `https://localhost:3000` in Puppeteer's dedicated Chrome profile with remote debugging on `127.0.0.1:9222`. Complete or dismiss onboarding in that tab. The browser profile persists at `/tmp/em-chrome-shared`, so its offline thoughtspace remains available between launches.

Configure an MCP host to launch the server from an absolute repository path:

```json
{
  "mcpServers": {
    "em": {
      "command": "yarn",
      "args": ["--cwd", "/absolute/path/to/em", "mcp"]
    }
  }
}
```

Restart or reconnect the MCP host after changing its configuration. The stdio server intentionally writes no logs to stdout because stdout is reserved for MCP messages.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `EM_MCP_BROWSER_URL` | `http://127.0.0.1:9222` | Chrome DevTools Protocol endpoint used by the MCP server. |
| `EM_MCP_URL_MATCH` | `localhost:3000` | Substring used to select the em tab. Set this when the app runs on another host or port. |
| `EM_CHROME_PORT` | `9222` | Remote-debugging port opened by `shared-chrome.mjs`. Keep it aligned with `EM_MCP_BROWSER_URL`. |
| `EM_CHROME_START_URL` | unset | Optional URL opened by `shared-chrome.mjs`; `yarn mcp:chrome` sets it to the local app. |
| `EM_CHROME_HEADLESS` | headless | Set to `0` for a visible Chrome; `yarn mcp:chrome` does this automatically. |

The server also accepts the older `EM_BRIDGE_BROWSER_URL` and `EM_BRIDGE_URL_MATCH` variables as fallbacks.

## Tool surface

| Tool | Capability |
|---|---|
| `get_editor_state` | Current focus/caret, editor status, and thoughts actually rendered after expansion and autofocus. |
| `get_thought` | One physical thought with stable id, parent, ordered children, path, note, rank, timestamps, and autofocus. |
| `get_tree` | Bounded nested physical hierarchy, optionally loading descendants and including meta/archive branches. |
| `search_thoughts` | Case-insensitive search over the thoughts currently loaded in the editor. |
| `set_focus` | Focus a thought or its note by id, set the target caret offset, or clear focus. |
| `create_thought` | Create under a parent with first/last/before/after placement and optional focus. |
| `edit_thought` | Edit the text content of a thought. |
| `update_thought` | Edit value/note, move to another parent, and reorder a thought. |
| `delete_thought` | Recursively delete a physical thought subtree. |
| `list_commands` | Discover all user-facing commands and their live availability/active state. |
| `execute_command` | Execute a command by id against current focus. |
| `undo` / `redo` | Traverse normal em mutation history. |

The live viewport is also exposed as the `em://editor/visible` MCP resource.

## Addressing and hierarchy

Thought values are not unique. Always mutate using the stable `id` returned by a read tool. `parentId`, `childIds`, and `path` describe physical storage hierarchy. `displayPath` and `depth` in `get_editor_state` describe the current rendered hierarchy, which may differ in a context view.

`get_editor_state.visibleThoughts` contains autofocus states `show` and `dim`. It excludes `hide` and `hide-parent` nodes exactly as the editor renderer does and reports their count in `hiddenByAutofocus`. Use `get_tree` when the agent needs hierarchy outside the current viewport.

Passing a null or omitted `parentId` to a mutation means the home root. Deletion is recursive. `update_thought` rejects cycles, invalid sibling references, and duplicate meta attributes that would corrupt a parent's attribute map.

`get_tree` is bounded by both depth and node count. If `truncated` is true, continue with `get_tree` or `get_thought` on returned child ids rather than requesting an unbounded thoughtspace in one model context.
