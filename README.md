# ai-review CLI

A local developer tool that enables AI agents (Claude Code, Cursor, GitHub Copilot, etc.) to perform automated Merge Request code reviews against GitLab.

- [ai-review CLI](#ai-review-cli)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Usage](#usage)
    - [Step 1 — Configure credentials (one-time)](#step-1--configure-credentials-one-time)
    - [Step 2 — Review an MR with your AI agent](#step-2--review-an-mr-with-your-ai-agent)
    - [How it works end-to-end](#how-it-works-end-to-end)
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

Alternatively, install as a global npm package:

```bash
npm install
npm run build
npm install -g .   # installs `ai-review` globally via npm
```

To uninstall the global package later:

```bash
npm uninstall -g ai-review-cli
```

Or run directly without building:

```bash
npx tsx src/cli/index.ts <command>
```

---

## Usage

This tool acts as a bridge between your AI IDE and Git Provider(Gitlab). The agent calls `ai-review` to fetch structured MR context, then performs its own code review and optionally posts comments back.

### Step 1 — Configure credentials (one-time)

Run this once for every GitLab instance you work with:

```bash
ai-review configure gitlab
```

You will be prompted for your GitLab base URL and a Personal Access Token with `api` and `read_repository` scopes.

### Step 2 — Review an MR with your AI agent

1. Open AI Agent chat in your IDE (e.g. `Cmd+Shift+C` for Claude Code, `Cmd+I` for Cursor, `Cmd+Alt+I` for GitHub Copilot)
2. Paste this:

   ```
   Run `ai-review get-context "<MR_URL>"` and review its changes in the output file
   ```

   The command will fetch the MR context (title, description, changed files with diffs) and write it to a JSON file (`ai-review-output/review.json` by default).

3. The AI agent will review the output file and return a structured review.

---

### How it works end-to-end

```
You (in IDE chat)
    │  "Review MR #123"
    ▼
AI Agent
    │  ai-review get-context <MR_URL> [--stdout | --output <path>]
    ▼
ai-review CLI   ──►  GitLab API
    │  returns MRContext JSON
    ▼
AI Agent  (runs code review)
    │  structured feedback
    ▼
You
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
ai-review get-context <MR_URL> [--stdout] [--output <path>]
```

Pass the full GitLab Merge Request URL — works for both `gitlab.com` and self-hosted instances.
The correct credentials are selected automatically based on the URL's domain.

| Flag                    | Behaviour                                                                 |
| ----------------------- | ------------------------------------------------------------------------- |
| _(none)_                | Writes JSON to `ai-review-output/review.json` and logs the path to stderr |
| `--stdout`              | Prints JSON to stdout                                                     |
| `--output <path>`       | Writes JSON to the specified path and logs it to stderr                   |
| `--output` + `--stdout` | `--output` takes precedence; writes to the specified path                 |

```bash
# Default — writes to ai-review-output/review.json
ai-review get-context https://gitlab.com/group/repo/-/merge_requests/123

# Print to stdout
ai-review get-context https://gitlab.com/group/repo/-/merge_requests/123 --stdout

# Write to a custom path
ai-review get-context https://gitlab.com/group/repo/-/merge_requests/123 --output /tmp/mr-context.json

# Self-hosted instance
ai-review get-context https://gitlab.mycompany.com/group/repo/-/merge_requests/456
```

The JSON output has the following shape:

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
| ----- | ------------------------------------- | ----------- |
| 1     | MR Context Fetch CLI                  | ✅ Complete |
| 2     | Prompt + Structured Output Validation | Planned     |
| 3     | Comment Publisher                     | Planned     |
| 4     | MCP Server                            | Future      |
