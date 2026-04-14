# STARTING_INSTRUCTIONS.md

**Temporary file. You will delete this file yourself in Step 4.**

You are Claude Code, opened for the first time in a freshly-cloned Sunnyfounder DEDO tool project. Your job right now is to turn this generic template into a project ready for real implementation work — nothing more. **Do not start implementing business logic until the user has reviewed and confirmed `BUSINESS_LOGIC.md`.**

## Step 1 — Locate the spec and the tool name

The user's first message in this Claude Code session contains:

1. A tool name — an ASCII lowercase hyphenated identifier (e.g. `seo-rank-monitor`).
2. A full tool specification, sitting between these two markers:

   ```
   ========== 規格開始 ==========
   ... spec content ...
   ========== 規格結束 ==========
   ```

If either is missing or ambiguous, stop and ask the user before doing anything else.

## Step 2 — Substitute `{{TOOL_NAME}}`

Replace every occurrence of the literal string `{{TOOL_NAME}}` in the project with the real tool name. Files currently containing it include:

- `package.json`
- `README.md`
- `BUSINESS_LOGIC.md`
- `src/index.ts`
- `src/cli.ts`
- `src/db.ts`
- `src/logger.ts`
- `src/web/server.ts`
- `src/web/views/index.ejs` (indirect — via `toolName` local, no substitution needed, but grep anyway)

After the substitution, run a project-wide search for `{{TOOL_NAME}}` and confirm zero matches.

## Step 3 — Populate BUSINESS_LOGIC.md from the spec

Rewrite `BUSINESS_LOGIC.md` end-to-end so every section is filled from the spec. **Preserve the Traditional Chinese section headings exactly as they appear in the template** — do not translate them to English, do not invent new structure. The body text you write should also be in Traditional Chinese (the tool owner is a non-technical Sunnyfounder employee who reviews this file themselves). The only exceptions are the structural tags `What:` and `Why:`, which stay in English so Claude can grep for rules missing a rationale.

Map the spec into the template like this:

- **1. 目的** ← the spec's "what problem / for whom" framing
- **2. 範圍** ← the "does / does not" bullets from the spec
- **3. 輸入** ← what data the tool consumes and where it comes from
- **4. 處理規則** ← every rule the spec describes, each formatted as:
  - **What**: [規則內容]
  - **Why**: [為什麼 — 誰決定的、哪份合約要求的、哪次過去踩過的坑]
  - If the spec does not give a *why* for a rule, write `**Why**: [待與使用者確認]` and add the rule to the open-questions list you report in Step 5. **Do not invent reasons.**
- **5. 輸出** ← what the tool produces and who reads it
- **6. 邊界案例與例外** ← anything the spec flags as unusual or explicitly handled
- **7. 規則來源** ← who decided what, if the spec names people
- **8. 決策紀錄** ← one entry for today: `[YYYY-MM-DD] — 初次建立，從 scoping-sunnyfounder-automations 產出的規格初始化`. Use the Asia/Taipei local date.

Do not drop rules the spec contains. Do not add rules the spec does not contain.

## Step 4 — Delete this file

Once `{{TOOL_NAME}}` is gone and `BUSINESS_LOGIC.md` is populated:

```bash
rm STARTING_INSTRUCTIONS.md
```

Do not commit anything — leave commits to the user.

## Step 5 — Stop and hand back to the user

**Do not start implementing the tool yet.** Report to the user:

1. The tool name you used
2. A 3–5 bullet summary of what `BUSINESS_LOGIC.md` now says
3. Any open questions — rules whose *why* was missing from the spec, ambiguities, things you'd want clarified before writing code
4. Ask them to open `BUSINESS_LOGIC.md` and confirm it's accurate

Only after the user has confirmed `BUSINESS_LOGIC.md` should you read `CLAUDE.md` and begin implementation.
