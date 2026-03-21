# Pre-Merge Checklist

## 1. Code Formatting

- [ ] Code formatted: `deno task fmt`
- [ ] No lint errors: `deno task lint`
- [ ] Type check passes: `deno task check`
- [ ] Formatting applied *before* committing (not as a separate commit unless it's the only change)

## 2. Test Execution & Reporting

- [ ] All tests pass: `deno task test`
- [ ] Coverage meets requirements: `deno task test:coverage`
- [ ] Coverage report generated: `deno task coverage`
- [ ] `tests/REPORT.md` created or updated with results
- [ ] Any test failures documented with root cause assessment (even if unfixed)

## 3. Documentation Sync

### Inline Documentation

- [ ] Exported functions have JSDoc docstrings
- [ ] Exported interfaces and types have JSDoc docstrings
- [ ] New modules have `@module` docstring at file top
- [ ] Complex logic has explanatory comments

### Doc Site (`docs/docs-site/`)

- [ ] Architecture page updated if system structure changed
- [ ] Project structure page updated if directories added/removed
- [ ] Development phases page updated if phase milestones changed
- [ ] Getting started page updated if setup steps changed

### Diagrams (`docs/diagrams/`)

- [ ] `agent-suite-internal-diagram.mermaid` updated if modules added/removed/rewired
- [ ] `system-architecture-diagram.mermaid` updated if external services or layers changed
- [ ] New diagrams created for new subsystems (if warranted)

### Change Records

- [ ] `CHANGES.md` updated with feature summary
- [ ] Decision records created in `docs/decisions/` (if architectural decision made)
- [ ] API documentation updated (if endpoints changed)

## 4. Architecture Compliance

- [ ] Follows interface-driven design (rule #2)
- [ ] Uses path alias imports (rule #1)
- [ ] TDD workflow followed (rule #3)
- [ ] No direct imports of external dependencies in core
- [ ] `deepagents`/`@langchain/*` imports only in adapter files

## 5. Security Review

- [ ] No secrets committed (check `.env` patterns)
- [ ] No hardcoded credentials
- [ ] Input validation present at boundaries
- [ ] OWASP Top 10 vulnerabilities checked

## 6. Git Hygiene

- [ ] Meaningful commit messages with correct prefixes
- [ ] No merge commits from main into feature branch (rebase instead)
- [ ] Branch is rebased on latest main
- [ ] No WIP or fixup commits remaining
- [ ] `[FEATURE]` prefix used only in MR titles, never in commits

## CHANGES.md Entry Format

```markdown
## [Feature Name] (YYYY-MM-DD)

### Summary

Brief description of what was added/changed.

### Changes

- Added: New functionality
- Changed: Modified behavior
- Fixed: Bug fixes
- Removed: Deprecated items

### Files Modified

- `src/path/to/file.ts` - Description

### Breaking Changes

None / List any breaking changes

### Migration Notes

None / Steps required for existing users
```

## Decision Record Format

Create in `docs/decisions/` with naming: `YYYYMMDD-HHMMSS-short-title.md`

```markdown
# Decision: [Title]

**Date:** YYYY-MM-DD HH:MM:SS
**Status:** Accepted | Proposed | Deprecated
**Context:** Why this decision was needed
**Decision:** What was decided
**Consequences:** Impact of this decision
**Alternatives Considered:** Other options evaluated
```
