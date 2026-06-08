# angular-standard.ai

Central AI standards repository for all Angular projects at Cedar Financial.

## Contents

| Path | Purpose |
|------|---------|
| [`rules/`](rules/) | Single source of truth for Angular company standards (markdown) |
| [`mcp-server/`](mcp-server/) | MCP server exposing standards as AI tools |
| [`.agents/skills/`](.agents/skills/) | Agent skills for the development workflow |

## MCP Server

The [`angular-standard-ai`](mcp-server/) MCP server lets any Angular project consume company standards without duplicating rules. Connect it from Cursor, Claude Code, or Claude Desktop.

```bash
cd mcp-server
npm install
npm run build
```

See [mcp-server/README.md](mcp-server/README.md) for configuration examples.

## Rules

Update standards once in `rules/` — all connected MCP clients receive the changes:

- `angular-rules.md` — Core patterns and prohibitions
- `folder-structure.md` — Approved file locations
- `signals.md` — Signal and RxJS rules
- `code-review.md` — PR review checklist
