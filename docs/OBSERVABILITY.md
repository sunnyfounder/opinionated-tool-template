# Observability contract

`src/logger.ts` exports four helpers. Use these — never ad-hoc console logs or raw pino calls at call sites.

## `log`
Raw pino instance. For unstructured debug lines only.

## `logEvent(type, fields)`
Records "something happened". Use event types from the exported `EVENT` constant:
- `TOOL_START` — process boot
- `LLM_CALL` — LLM API call (prefer `observeLLM` instead)
- `HTTP_REQUEST` — outbound HTTP
- `SCHEDULED_RUN` — cron job fired
- `EXTERNAL_FETCH` — scraper fetch
- `ERROR` — caught error

Add new constants to `EVENT` if the tool needs one — don't hardcode raw strings at call sites.

Any new major operation — scheduled job firing, external HTTP call, user hitting a route that triggers real work — gets a `logEvent` line. "Major" means something you'd want to see in the log when debugging a complaint two weeks later.

## `observeLLM({ model, purpose }, fn)`
Wrap **every** LLM API call with this. It logs model, duration, tokens in/out, and cost automatically, and emits an `ERROR` event on failure before re-throwing. Calling an LLM without this wrapper breaks the DEDO observability contract.

## `logQuery({ session_id, query_text, response_text })`
Call once per natural-language query the user sends. Stores raw question and raw answer — repeated rephrasings in one session signal the tool couldn't answer, which surfaces functionality gaps. If a tool handles sensitive data, redact before calling; don't skip the call.

Session ID strategy is the caller's call: rotating cookie for web UI, one UUID per CLI invocation.
