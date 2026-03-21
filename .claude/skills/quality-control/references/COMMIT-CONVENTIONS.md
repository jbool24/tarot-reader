# Commit Conventions

## Feature Branches (merging to main)

Commits should tell a story:

```bash
git log --oneline main..HEAD

# Good commit sequence:
# abc1234 Add user authentication endpoint
# def5678 Implement JWT token validation
# ghi9012 Add rate limiting middleware
# jkl3456 Add integration tests for auth flow
```

## Commit Prefix Guide

### Key Guidelines
- Always start your commit message with one of the listed prefixes
- Use `[FEATURE]` only in Merge Request titles - not in commit messages
- For multiple changes, prioritize the most significant impact in the prefix
- Keep commit subjects concise (ideally <50 chars)
- Include a body for detailed explanations (>1 line)

#### Examples:
```git
[ADD]: Add new authentication service implementation
[BUGFIX]: Fix race condition in user session management
[REFACTOR]: Complete Phase 3 of project to add adapters
```

#### Commit Prefix List:

- `[ADD]` - For adding new features, files, or functionality
- `[BUGFIX]` - Bug fixes
- `[CHORE]` - Maintenance tasks
- `[CLEAN]` - For removing code, files, apply formatting, or cleaning up artifacts
- `[DOCS]` - Documentation changes
- `[PREPARE]` - For preparing code for merging back to the production branch (default: "main")
- `[PROBE]` - For adding diagnostics, logging, spike tests, and debugging code
- `[REFACTOR]` - For restructuring code without changing behavior
- `[RELEASE]` - For release-related commits and version updates

### Best Practices
1. Format your commit message as:
```
[PREFIX]: Subject line (one line)
(Blank line)
Commit body (details of the work performed) 
```

2. Avoid periods at the end of commit subjects
3. Use clear, imperative language for changes
4. Group related changes in single commits where possible

These guidelines will help maintain consistency and readability across your Git history.

## Sub-task Branches (merging to feature)

```bash
git checkout feature/add-auth
git merge --squash feature/add-auth/token-refresh
git commit -m "[ADD]: with token refresh functionality

- Implement refresh token rotation
- Add token expiry handling
- Update auth middleware

```

## Rebase Workflow

```bash
git fetch origin main
git rebase origin/main
# Resolve conflicts in each commit
git add .
git rebase --continue
git push --force-with-lease
```

## Common Issues

### Merge Conflicts

```bash
git fetch origin main
git rebase origin/main
# Resolve conflicts
git add .
git rebase --continue
```

### Coverage Drops

```bash
deno task test:coverage
deno task coverage
# Add tests for uncovered code
```
