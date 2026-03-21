---
name: quality-control
description: >
  Activates when completing features, fixing bugs, or preparing Merge Requests.
  Ensures code formatting, test execution with reporting, documentation sync
  (inline docstrings, doc-site, diagrams), commit hygiene, and MR preparation.
  Use after any meaningful code change or when preparing an MR.
license: MIT
compatibility: Requires git and deno task runner
metadata:
  author: Justin Bellero <j.bellero@dreamrocksmarttech.com>
  version: '2.0'
allowed-tools: Bash(git:*) Bash(deno:*)
---

# Quality Control Skill

Ensures code quality, formatting, test coverage with reporting, documentation sync, and adherence to branching/commit conventions when preparing code for review.

## When to Use

- After completing any meaningful code changes (features, refactors, bug fixes)
- Before committing work at the end of a session
- Preparing to submit a Merge Request to main
- Performing final quality checks before code submission

## Workflow Overview

The quality control workflow has **five stages** that run in order. Each stage must pass before moving to the next.

```
1. FORMAT  →  2. TEST & REPORT  →  3. DOCS SYNC  →  4. COMMIT HYGIENE  →  5. MR PREP
```

---

## Stage 1: Formatting

**Always apply formatting after all code changes are complete.** This is non-negotiable — no commit should contain unformatted code.

```bash
deno task fmt
```

After formatting, verify no lint or type errors were introduced:

```bash
deno task lint && deno task check
```

If formatting introduced changes, those changes get folded into the relevant commit (not a separate "format" commit) unless the formatting is the *only* change, in which case use `[CLEAN]` prefix.

---

## Stage 2: Test Execution & Reporting

Run the full test suite and generate coverage. **Always leave a test report** so the main agent (or a future session) can pick up any failures.

### Run Tests

```bash
deno task test
```

### Generate Coverage Report

```bash
deno task test:coverage
deno task coverage
```

### Leave a Test Report

After running tests, create or update a report file at `tests/REPORT.md` with:

```markdown
# Test Report — YYYY-MM-DD HH:MM

## Summary
- **Status:** PASS | FAIL
- **Total:** X tests
- **Passed:** X
- **Failed:** X
- **Coverage:** X%

## Failures (if any)
### test-name
- **File:** path/to/test.test.ts
- **Error:** Brief description of what failed
- **Likely cause:** Your best assessment of root cause

## Notes
Any observations about flaky tests, slow tests, or areas needing more coverage.
```

See [references/TEST-REPORTS.md](references/TEST-REPORTS.md) for full conventions.

### Quality Gates

| Metric        | Phase 1 | Phase 2 | Phase 3 |
| ------------- | ------- | ------- | ------- |
| Test Coverage | 80%     | 85%     | 90%     |
| Lint Errors   | 0       | 0       | 0       |
| Type Errors   | 0       | 0       | 0       |

### Blocking Issues

- Failing tests
- Coverage below threshold
- Lint or type errors

**If tests fail and cannot be fixed in this session:** Document the failures in `tests/REPORT.md` and continue to Stage 3. Do NOT skip the report — the next session depends on it.

---

## Stage 3: Documentation Sync

All code changes must have their documentation kept in sync. This covers three documentation layers:

1. **Inline docstrings** — JSDoc on exported functions, interfaces, and types
2. **Doc site** — `docs/docs-site/` HTML pages reflecting current architecture
3. **Diagrams** — `docs/diagrams/` Mermaid files reflecting current system structure

See [references/DOCUMENTATION-SYNC.md](references/DOCUMENTATION-SYNC.md) for full conventions.

### Quick Checklist

- [ ] Exported functions/interfaces/types have JSDoc docstrings
- [ ] New modules have `@module` docstring at file top
- [ ] `docs/docs-site/` pages updated if architecture, project structure, or phases changed
- [ ] `docs/diagrams/*.mermaid` updated if modules were added, removed, or rewired
- [ ] `CHANGES.md` updated with feature summary
- [ ] `docs/decisions/` ADR created if an architectural decision was made

### When to Update What

| Change Type                        | Inline Docs | Doc Site | Diagrams | CHANGES.md | ADR |
| ---------------------------------- | ----------- | -------- | -------- | ---------- | --- |
| New exported function/type         | YES         | —        | —        | —          | —   |
| New module or directory            | YES         | YES      | YES      | YES        | —   |
| Module removed or renamed          | YES         | YES      | YES      | YES        | —   |
| Architecture change                | YES         | YES      | YES      | YES        | YES |
| New external dependency            | —           | YES      | maybe    | YES        | YES |
| Bug fix (no API change)            | —           | —        | —        | YES        | —   |
| Config/env changes                 | —           | YES      | —        | YES        | —   |

---

## Stage 4: Commit Hygiene

### Branch Rules

| Branch Type         | Forks From  | Merges To   | Squash |
| ------------------- | ----------- | ----------- | ------ |
| `feature/*`         | `main`      | `main`      | NO     |
| `feature/*/subtask` | `feature/*` | `feature/*` | YES    |
| `bugfix/*`          | `main`      | `main`      | NO     |
| `hotfix/*`          | `main`      | `main`      | NO     |

See [references/BRANCHING.md](references/BRANCHING.md) for full strategy.

### Commit Conventions

**Feature → Main**: Keep full history (no squash)
**Subtask → Feature**: Squash merge

All commits use prefix format: `[PREFIX]: Subject line`

Prefixes: `[ADD]`, `[BUGFIX]`, `[CHORE]`, `[CLEAN]`, `[DOCS]`, `[PREPARE]`, `[PROBE]`, `[REFACTOR]`, `[RELEASE]`

**`[FEATURE]` is only used in MR titles — never in commit messages.**

See [references/COMMIT-CONVENTIONS.md](references/COMMIT-CONVENTIONS.md) for full patterns.

### Rebase Before Push

```bash
git fetch origin main
git rebase origin/main
git push --force-with-lease
```

---

## Stage 5: Merge Request Preparation

Use templates from [references/MR-TEMPLATES.md](references/MR-TEMPLATES.md).

**MR Title Format**: `[TYPE] Brief description`

Types: FEATURE, FIX, REFACTOR, DOCS, TEST, CHORE

### Final Verification

```bash
git status
git diff --stat main..HEAD
deno task test:coverage
git push -u origin <branch-name>
```

### Pre-Merge Checklist

Run through the full [Pre-Merge Checklist](references/CHECKLIST.md) before submitting.

---

## Post-Merge Tasks

1. Delete merged branch (remote and local)
2. Update dependent branches
3. Verify deployment
4. Close related issues
