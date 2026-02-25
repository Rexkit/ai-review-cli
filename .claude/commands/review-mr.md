# MR Review Skill

Review a GitLab Merge Request using the `ai-review` CLI and provide structured inline comments.

## Arguments

`$ARGUMENTS` — Optional GitLab MR URL (e.g. `https://gitlab.com/group/repo/-/merge_requests/123`). If not provided, ask the user for it.

## Workflow

Follow these steps in order. Do not skip steps.

### Step 1 — Verify CLI is installed

Run:
```
ai-review --version
```

If the command is not found, inform the user:
> `ai-review` CLI is not installed. Run `npm install -g .` inside the `ai-review-cli` repo, or install it as instructed in the README.

Stop here if the CLI is not available.

### Step 2 — Check GitLab configuration

Run:
```
cat ~/.ai-review/credentials.json
```

If the file does not exist or contains no `gitlab` key, tell the user:
> GitLab credentials are not configured. Please run:
> ```
> ai-review configure gitlab
> ```
> Then re-run this skill once configuration is complete.

Stop here until the user has configured credentials.

### Step 3 — Obtain the MR URL

If `$ARGUMENTS` contains a URL (starts with `http`), use it directly.

Otherwise ask the user:
> Please provide the GitLab MR URL you want reviewed (e.g. `https://gitlab.com/group/repo/-/merge_requests/123`).

Validate that the URL matches the pattern `https://<host>/<path>/-/merge_requests/<number>` before proceeding.

### Step 4 — Fetch MR context

Run:
```
ai-review get-context <MR_URL>
```

This writes context to `~/.ai-review/mr-context.json` by default.

If the command exits with a non-zero code, print the stderr output and stop. Common errors to surface clearly:
- `CREDENTIALS_NOT_FOUND` — credentials missing for this GitLab host (ask user to run `ai-review configure gitlab`)
- `INVALID_URL` — malformed MR URL (ask user to double-check the URL)
- `API_ERROR` — network or API issue (show the message)

### Step 5 — Analyse the MR and generate review comments

Read the context file:
```
cat ~/.ai-review/mr-context.json
```

Analyse the MR thoroughly as a senior software engineer. Examine every changed file and its annotated diff. Focus on:

- **Bugs** — logic errors, off-by-one errors, null/undefined handling, incorrect conditions
- **Security** — injection flaws, hardcoded secrets, insecure defaults, improper auth checks
- **Performance** — unnecessary loops, missing indexes, N+1 queries, excessive allocations
- **Correctness** — wrong data types, missing edge cases, incorrect API usage
- **Readability** — confusing naming, missing context, overly complex logic
- **Test coverage** — untested branches, missing assertions

Line numbers in the diff are annotated as `[oldLine:newLine]`. Use the **newLine** value as the `line` field in your output. Only comment on lines that appear in the diff (do not cite lines outside the changed hunks).

Produce a review JSON object and write it to `~/.ai-review/review-output.json`:

```json
{
  "comments": [
    {
      "file": "path/to/changed/file.ts",
      "line": 42,
      "severity": "critical",
      "comment": "Concise, actionable explanation of the issue and how to fix it."
    }
  ]
}
```

Severity levels:
- `critical` — must be fixed: security vulnerability, data loss risk, or definite bug
- `warning` — should be fixed: performance issue, error handling gap, or bad practice
- `suggestion` — nice to fix: readability, minor style, or optional improvement

If there are no issues to report, write `{ "comments": [] }` and tell the user the MR looks clean.

### Step 6 — Validate the review output

Run:
```
ai-review validate-output ~/.ai-review/review-output.json
```

If validation fails, inspect the error, fix the JSON, and re-validate before continuing.

### Step 7 — Present a summary to the user

Print a concise summary:
- Total comments by severity (critical / warning / suggestion)
- A short bullet list of the most important findings (up to 5)

Example:
```
Review complete: 2 critical, 3 warning, 4 suggestion

Top findings:
• [critical] src/auth.ts:88 — JWT secret read from process.env without fallback validation
• [critical] src/db.ts:34 — SQL query built with string concatenation (injection risk)
• [warning]  src/api.ts:102 — Missing error handling on external HTTP call
```

### Step 8 — Ask whether to post comments

Ask the user:
> Would you like to post these comments to the MR on GitLab?
> If yes, which minimum severity should be posted?
>   1. `suggestion` — post all comments
>   2. `warning` — post warnings and critical only
>   3. `critical` — post critical issues only
>   4. No — skip posting

If the user selects 1–3, run:
```
ai-review post-comments <MR_URL> --input ~/.ai-review/review-output.json --severity <level>
```

Where `<level>` is `suggestion`, `warning`, or `critical` based on their choice.

Report how many comments were posted and how many were skipped (the CLI prints this on success).

If the user selects 4, acknowledge and stop.

## Notes

- All output files live under `~/.ai-review/` to avoid polluting the working directory.
- The credential file at `~/.ai-review/credentials.json` supports multiple GitLab instances keyed by hostname. Credentials are automatically selected based on the MR URL domain.
- Re-running this skill on the same MR will overwrite `~/.ai-review/mr-context.json` and `~/.ai-review/review-output.json`.
