# BUSINESS_LOGIC.md — {{TOOL_NAME}}

> This file is the source of truth for **why** this tool exists and **what rules** it enforces. The code is an implementation of this file. If you change the code, you may need to update this file in the same commit. See `CLAUDE.md` for the contract.

## 1. Purpose

[One paragraph: what business problem does this tool solve, for whom?]

## 2. Scope

**This tool does:**

- [bullet]
- [bullet]

**This tool does NOT:**

- [bullet — things people might expect but that are explicitly out of scope]
- [bullet]

## 3. Inputs

[Where does data come from? What format? Who provides it?]

## 4. Processing rules

Each rule should answer both *what* and *why*. The *why* is what makes this file valuable — anyone can read the code to see what it does; only this file explains why it does it that way.

### Rule 1: [short name]

**What**: [the rule]

**Why**: [the reason — which person decided, which contract requires it, which past failure it prevents, etc.]

### Rule 2: [short name]

**What**: [the rule]

**Why**: [the reason]

*(Add more rules as the tool grows. If this section passes ~400 lines, consider splitting into a `business-logic/` folder with one file per topic and an `index.md`.)*

## 5. Outputs

[What does the tool produce? Who consumes it? In what format?]

## 6. Edge cases and known exceptions

- **[edge case 1]**: [how the tool handles it and why]
- **[edge case 2]**: [same]

## 7. Rule provenance

Who made which decision, when, and why. This matters when rules need to be re-examined later — you want to know who to ask.

- **[rule X]** — [date] — [person] — [context]
- **[rule Y]** — [date] — [person] — [context]

## 8. Decision log

Append-only record of changes to business rules. Never delete entries; add new ones.

### [YYYY-MM-DD] — Initial creation
- Created from spec produced by `scoping-sunnyfounder-automations` skill
- Initial rules captured: [list]
- Open questions: [any]
