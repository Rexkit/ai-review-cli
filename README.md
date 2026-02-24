# ai-review CLI

A local developer tool that enables AI agents (Claude Code, Cursor, GitHub Copilot, etc.) to perform automated Merge Request code reviews against GitLab.

## Requirements

- Node.js 20+

## Setup

```bash
npm install
npm run build
npm link        # makes `ai-review` available globally
```

Or run directly without building:

```bash
npx tsx src/cli/index.ts <command>
```

---

## Commands

### Configure GitLab credentials

```bash
ai-review configure gitlab
```

Prompts for your Personal Access Token and base URL, then stores them at `~/.ai-review/credentials.json`.

Required GitLab token scopes: `api`, `read_repository`.

---

### Fetch MR context

```bash
ai-review get-context <MR_ID> --project-id <PROJECT_ID>
```

`PROJECT_ID` may be a numeric ID (`123`) or a URL-encoded path (`group/repo`).

Outputs a JSON object consumed by AI agents:

```json
{
  "title": "...",
  "description": "...",
  "sourceBranch": "...",
  "targetBranch": "...",
  "files": [
    {
      "path": "src/foo.ts",
      "language": "typescript",
      "diff": "..."
    }
  ]
}
```

---

## Project structure

```
src/
  cli/
    index.ts                  # CLI entry point
    commands/
      configure.ts            # `configure gitlab`
      get-context.ts          # `get-context`
  providers/
    base.ts                   # GitProvider interface
    gitlab/
      gitlab-client.ts        # Raw GitLab API client (axios)
      gitlab-provider.ts      # GitProvider implementation
  context/
    diff-parser.ts            # Language detection, filtering helpers
    mr-context-builder.ts     # Assembles MRContext from provider
  schema/
    mr-context.schema.ts      # Zod schema for MRContext
  utils/
    credentials.ts            # Read/write ~/.ai-review/credentials.json
```

---

## Roadmap

| Phase | Scope                                 | Status      |
|-------|---------------------------------------|-------------|
| 1     | MR Context Fetch CLI                  | ✅ Complete |
| 2     | Prompt + Structured Output Validation | Planned     |
| 3     | Comment Publisher                     | Planned     |
| 4     | MCP Server                            | Future      |
