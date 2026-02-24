# ai-review CLI

A local developer tool that enables AI agents (Claude Code, Cursor, GitHub Copilot, etc.) to perform automated Merge Request code reviews against GitLab.

- [ai-review CLI](#ai-review-cli)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Commands](#commands)
    - [Configure GitLab credentials](#configure-gitlab-credentials)
    - [Fetch MR context](#fetch-mr-context)
  - [Project structure](#project-structure)
  - [Roadmap](#roadmap)


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

Prompts for your Personal Access Token and base URL, then stores the entry (keyed by domain) at `~/.ai-review/credentials.json`.
Run the command once per GitLab instance you want to use.

Required GitLab token scopes: `api`, `read_repository`.

Example credentials file with multiple instances:

```json
{
  "gitlab": {
    "gitlab.com": {
      "token": "glpat-xxxxx",
      "baseUrl": "https://gitlab.com"
    },
    "gitlab.mycompany.com": {
      "token": "glpat-yyyyy",
      "baseUrl": "https://gitlab.mycompany.com"
    }
  }
}
```

---

### Fetch MR context

```bash
ai-review get-context <MR_URL>
```

Pass the full GitLab Merge Request URL — works for both `gitlab.com` and self-hosted instances.
The correct credentials are selected automatically based on the URL's domain.

```bash
# gitlab.com
ai-review get-context https://gitlab.com/group/repo/-/merge_requests/123

# self-hosted
ai-review get-context https://gitlab.mycompany.com/group/repo/-/merge_requests/456
```

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
