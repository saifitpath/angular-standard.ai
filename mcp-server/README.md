# angular-standard-ai MCP Server

Central [Model Context Protocol](https://modelcontextprotocol.io/) server for company-wide Angular standards. All Angular projects connect to this single server — rules are maintained once in the `rules/` directory at the repository root.

## Tools

| Tool | Purpose |
|------|---------|
| `get_angular_rules` | Read all markdown rule files from `rules/` |
| `requirement_taker` | Transform a requirement into feature name, impacted files, plan, acceptance criteria, risks, and architecture notes |
| `validate_angular_code` | Validate source code against company standards (returns `PASSED` or `FAILED`) |
| `validate_project_structure` | Validate file paths against approved folder locations |
| `review_angular_pr` | Full PR review: architecture, signals, structure, maintainability, performance |

## Prerequisites

- **Node.js** 18 or later
- **npm** 9+

## Verification

Run these commands from the `mcp-server/` directory to confirm the build produces a runnable entry point:

```powershell
npm install
npm run build
node dist/index.js
```

**Expected build output** (`npm run build`):

```
Cleaned .../mcp-server/dist
BUILD VERIFICATION PASSED
Entry point : dist/index.js
...
```

**Expected runtime output** (`node dist/index.js`):

```
[angular-standard-ai] v1.0.0 starting on stdio transport...
[angular-standard-ai] Rules directory: .../angular-standard.ai/rules
[angular-standard-ai] Ready — waiting for client connections.
```

Logs appear on **stderr** only. The process waits on stdin — press `Ctrl+C` to stop.

**Confirm emitted files** (PowerShell):

```powershell
Get-ChildItem -Path dist -Recurse
```

You should see at minimum:

```
dist/index.js
dist/services/rules.service.js
dist/services/structure.service.js
dist/services/validation.service.js
dist/services/requirement.service.js
```

Re-run verification without rebuilding:

```powershell
npm run verify
```

## Local Development

```bash
cd mcp-server
npm install
npm run build
npm start      # runs node dist/index.js
npm run dev    # tsx src/index.ts (no build)
```

## Build Output

| Setting | Value |
|---------|-------|
| TypeScript `rootDir` | `./src` |
| TypeScript `outDir` | `./dist` |
| Entry point | `dist/index.js` |
| Module system | ESM (`"type": "module"`) |

The build script runs `clean → tsc → verify`. If `dist/index.js` is missing after build, the verify step exits with code 1.

## Installation

### Option A — Local path (recommended for development)

Build the server, then point your MCP client at the compiled entry point:

```json
{
  "mcpServers": {
    "angular-standard-ai": {
      "command": "node",
      "args": ["C:/path/to/angular-standard.ai/mcp-server/dist/index.js"]
    }
  }
}
```

### Option B — npx from monorepo root

```json
{
  "mcpServers": {
    "angular-standard-ai": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "cwd": "C:/path/to/angular-standard.ai"
    }
  }
}
```

### Option C — tsx for development (no build)

```json
{
  "mcpServers": {
    "angular-standard-ai": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "C:/path/to/angular-standard.ai/mcp-server"
    }
  }
}
```

## Connect to Cursor

1. Open **Cursor Settings → MCP** (or edit `.cursor/mcp.json` in your project or user config).
2. Add the server configuration. Example for Windows:

```json
{
  "mcpServers": {
    "angular-standard-ai": {
      "command": "node",
      "args": [
        "C:/Users/YourName/path/to/angular-standard.ai/mcp-server/dist/index.js"
      ]
    }
  }
}
```

3. Restart Cursor or reload MCP servers from the MCP panel.
4. The five tools appear in the agent tool list when working in any Angular project.

See also: [`examples/mcp.cursor.json`](examples/mcp.cursor.json)

## Connect to Claude Code

Claude Code reads MCP configuration from `.mcp.json` in the project root (or global config).

1. Build the MCP server (`npm run build` inside `mcp-server/`).
2. Create or update `.mcp.json` in your Angular project:

```json
{
  "mcpServers": {
    "angular-standard-ai": {
      "command": "node",
      "args": [
        "../angular-standard.ai/mcp-server/dist/index.js"
      ]
    }
  }
}
```

Adjust the path relative to your Angular project's root.

3. Restart Claude Code or run `claude mcp list` to verify the server is connected.

See also: [`examples/mcp.claude.json`](examples/mcp.claude.json)

## Connect to Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "angular-standard-ai": {
      "command": "node",
      "args": ["C:/path/to/angular-standard.ai/mcp-server/dist/index.js"]
    }
  }
}
```

## Rules Source of Truth

All standards live in the repository root `rules/` folder:

```
rules/
├── angular-rules.md      ← Core Angular patterns and prohibitions
├── folder-structure.md   ← Approved file locations
├── signals.md            ← Signal and RxJS bridging rules
└── code-review.md        ← PR review checklist
```

Update these files to change standards for **all** connected Angular projects. No per-repo duplication needed.

## Architecture

```
mcp-server/src/
├── index.ts                          ← MCP server entry, tool registration
└── services/
    ├── rules.service.ts              ← Reads rules/ markdown files
    ├── structure.service.ts          ← Folder path validation
    ├── validation.service.ts         ← Code standard validation engine
    └── requirement.service.ts        ← Requirement analysis
```

Services are shared across tools so validation logic stays DRY.

## Example Tool Usage

### get_angular_rules

No required input. Returns all rule documents as JSON.

Optional: `{ "fileName": "signals.md" }` for a single file.

### requirement_taker

```json
{
  "requirement": "Add a payment history page to the payments feature with API integration"
}
```

### validate_angular_code

```json
{
  "files": [
    {
      "filePath": "src/app/features/payments/pages/history/history.component.ts",
      "content": "@Component({...}) export class HistoryComponent { ... }"
    }
  ]
}
```

### validate_project_structure

```json
{
  "filePaths": [
    "src/app/features/payments/pages/history/history.component.ts",
    "src/app/components/bad-location.component.ts"
  ]
}
```

### review_angular_pr

```json
{
  "files": [{ "filePath": "...", "content": "..." }],
  "prDescription": "Adds payment history feature"
}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server not appearing in client | Confirm `dist/index.js` exists (`npm run build`) |
| Rules not found | Server resolves repo root relative to its install path; keep `rules/` at repo root |
| stdout corruption | Never use `console.log` in server code — use `console.error` only |
| Path errors on Windows | Use forward slashes or escaped backslashes in config `args` |

## License

Internal use — Cedar Financial.
