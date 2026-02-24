# ai-review CLI

A local developer tool that enables AI agents (Claude Code, Cursor, GitHub Copilot, etc.) to perform automated Merge Request code reviews against GitLab.

- [ai-review CLI](#ai-review-cli)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Usage](#usage)
    - [Step 1 — Configure credentials (one-time)](#step-1--configure-credentials-one-time)
    - [Step 2 — Open your AI IDE](#step-2--open-your-ai-ide)
    - [Step 3 — Ask the agent to review an MR](#step-3--ask-the-agent-to-review-an-mr)
    - [Claude Code](#claude-code)
    - [Cursor](#cursor)
    - [GitHub Copilot (VS Code)](#github-copilot-vs-code)
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

Or run directly without building:

```bash
npx tsx src/cli/index.ts <command>
```

---

## Usage

This tool acts as a bridge between your AI IDE and GitLab. The agent calls `ai-review` to fetch structured MR context, then performs its own code review and optionally posts comments back.

### Step 1 — Configure credentials (one-time)

Run this once for every GitLab instance you work with:

```bash
ai-review configure gitlab
```

You will be prompted for your GitLab base URL and a Personal Access Token with `api` and `read_repository` scopes.

### Step 2 — Open your AI IDE

Navigate to the project you are reviewing in your IDE. Having the repository open is optional—the CLI only needs the MR URL.

### Step 3 — Ask the agent to review an MR

Give the agent the full GitLab Merge Request URL and ask it to perform a code review. The examples below show the exact phrasing and setup for each supported IDE.

---

### Claude Code

Claude Code can execute shell commands directly, so no extra configuration is needed.

1. Open a terminal in Claude Code or start a session in your repo directory.
2. Paste a prompt like:

   ```
   Review this MR and give me detailed feedback:
   https://gitlab.com/group/repo/-/merge_requests/123
   ```

3. Claude will run:

   ```bash
   ai-review get-context https://gitlab.com/group/repo/-/merge_requests/123
   ```

4. It reads the JSON output, analyses the diffs, and returns a structured review.

> **Tip:** Follow up with _"Post your review comments to the MR"_ and Claude will run `ai-review post-comments` once that phase is available.

---

### Cursor

Cursor's Agent mode can run terminal commands autonomously.

1. Open the **Chat** panel and switch to **Agent** mode (the toggle in the top-right of the chat input).
2. Paste a prompt like:

   ```
   Use the ai-review CLI to fetch the context for this MR and review it:
   https://gitlab.mycompany.com/group/repo/-/merge_requests/456
   ```

3. Cursor will open a terminal and run:

   ```bash
   ai-review get-context https://gitlab.mycompany.com/group/repo/-/merge_requests/456
   ```

4. It parses the JSON output and returns an inline code review.

> **Tip:** If `ai-review` is not found, make sure you ran `npm link` during setup, or prefix the command with `npx tsx src/cli/index.ts`.

---

### GitHub Copilot (VS Code)

GitHub Copilot requires agent mode (available in VS Code with the Copilot Chat extension).

1. Open the **Copilot Chat** panel (`Ctrl+Alt+I` / `Cmd+Alt+I`).
2. Switch to **Agent** mode by clicking the mode selector and choosing **Agent**.
3. Paste a prompt like:

   ```
   Run ai-review get-context on this MR and review the changes:
   https://gitlab.com/group/repo/-/merge_requests/789
   ```

4. Copilot will invoke the terminal tool and run:

   ```bash
   ai-review get-context https://gitlab.com/group/repo/-/merge_requests/789
   ```

5. It reads the structured JSON and summarises the review in the chat panel.

> **Tip:** You can add a custom instruction file (`.github/copilot-instructions.md`) with content like _"Use the `ai-review` CLI to fetch MR context before reviewing GitLab merge requests."_ so Copilot applies this automatically.

---

### How it works end-to-end

```
You (in IDE chat)
    │  "Review MR #123"
    ▼
AI Agent
    │  ai-review get-context <MR_URL>
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
