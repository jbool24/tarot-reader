# Test Report Conventions

Test reports serve as a handoff mechanism between sessions. When tests are run during quality control, the results must be captured in `tests/REPORT.md` so that the next session (or the main agent) can immediately understand the state of the test suite without re-running everything.

## Report Location

```
tests/REPORT.md
```

This file is **overwritten** each time the quality control workflow runs. It represents the most recent test state, not a historical log.

## Report Format

```markdown
# Test Report — YYYY-MM-DD HH:MM

## Summary

- **Status:** PASS | FAIL
- **Total:** X tests
- **Passed:** X
- **Failed:** X
- **Skipped:** X (if any)
- **Coverage:** X%
- **Phase Target:** X% (Phase 1: 80%, Phase 2: 85%, Phase 3: 90%)
- **Coverage Met:** YES | NO

## Environment

- **Runtime:** Deno X.X.X
- **Branch:** branch-name
- **Last Commit:** abc1234 — commit message

## Failures

### `test name as shown in output`

- **File:** `tests/unit/path/to/file.test.ts`
- **Error:** The actual error message or assertion failure
- **Likely Cause:** Your best assessment of why this failed
- **Suggested Fix:** What you think needs to change (if known)

### `another failing test`

- **File:** `tests/integration/path/to/file.test.ts`
- **Error:** Description
- **Likely Cause:** Assessment
- **Suggested Fix:** Suggestion

## Warnings

Note any non-blocking concerns:

- Flaky tests (passed but have failed intermittently)
- Slow tests (>1s for unit, >5s for integration)
- Tests with `sanitizeOps: false` or `sanitizeResources: false` that may leak
- Areas with low coverage that should get more tests

## Notes

Any additional observations relevant to the next session:

- Tests that were added or removed in this session
- Known gaps in test coverage
- Tests that are temporarily skipped and why
```

## When Status is PASS

When all tests pass and coverage meets the threshold, the report is brief:

```markdown
# Test Report — 2026-02-11 14:30

## Summary

- **Status:** PASS
- **Total:** 47 tests
- **Passed:** 47
- **Failed:** 0
- **Coverage:** 83%
- **Phase Target:** 80% (Phase 1)
- **Coverage Met:** YES

## Environment

- **Runtime:** Deno 2.6.1
- **Branch:** feature/orchestrator-adapter
- **Last Commit:** abc1234 — [ADD]: Implement DeepAgents adapter

## Failures

None.

## Warnings

None.

## Notes

Added 12 new unit tests for the orchestrator adapter.
```

## When Status is FAIL

When tests fail, the report must provide enough context for the next session to act without re-investigating from scratch:

```markdown
# Test Report — 2026-02-11 14:30

## Summary

- **Status:** FAIL
- **Total:** 47 tests
- **Passed:** 44
- **Failed:** 3
- **Coverage:** 71%
- **Phase Target:** 80% (Phase 1)
- **Coverage Met:** NO

## Environment

- **Runtime:** Deno 2.6.1
- **Branch:** feature/orchestrator-adapter
- **Last Commit:** def5678 — [REFACTOR]: Extract model factory

## Failures

### `AgentOrchestrator - invoke returns structured result`

- **File:** `tests/unit/core/orchestrator/deepagents-adapter.test.ts`
- **Error:** `AssertionError: Expected "completed" but got "pending"`
- **Likely Cause:** The adapter is not awaiting the full graph execution before returning
- **Suggested Fix:** Check `runGraph()` in deepagents.adapter.ts — likely needs `await` on the final state

### `ModelFactory - creates Ollama provider with custom base URL`

- **File:** `tests/unit/core/orchestrator/model-factory.test.ts`
- **Error:** `TypeError: Cannot read properties of undefined (reading 'baseUrl')`
- **Likely Cause:** OllamaConfig type changed but factory wasn't updated
- **Suggested Fix:** Update `createOllamaModel()` to use the new config shape from types.ts

### `Chat service - delegates to orchestrator`

- **File:** `tests/unit/core/chat/service.test.ts`
- **Error:** `AssertionError: spy was not called`
- **Likely Cause:** Chat service still calls old executor instead of new orchestrator
- **Suggested Fix:** Migration incomplete — update chat service to call orchestrator.invoke()

## Warnings

- `Redis connection test` is slow (~3s) — consider mocking for unit tests

## Notes

3 failures are all related to the orchestrator migration (Phase C).
The chat service migration is not yet complete — this is expected.
Coverage gap is primarily in the new adapter code.
```

## Rules

1. **Always generate a report** after running tests, even when everything passes
2. **Overwrite** the previous report — this is current state, not a log
3. **Be specific** about failures — file paths, error messages, and root cause assessment
4. **Include coverage numbers** — the next session needs to know if coverage targets are met
5. **Note the branch and commit** — context matters when picking up work
6. **Do not commit `tests/REPORT.md` to main** — add it to `.gitignore` if it isn't already. It's a session artifact, not project history.

## Generating the Report

The report is written manually by the agent after analyzing test output. The workflow is:

1. Run `deno task test` — capture output
2. Run `deno task test:coverage` — capture coverage percentage
3. Parse the results and write `tests/REPORT.md`
4. If all pass: brief report with summary
5. If any fail: detailed report with failure analysis
