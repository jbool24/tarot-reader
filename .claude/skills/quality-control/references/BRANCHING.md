# Branching Strategy

## Branch Hierarchy

```
main
└── feature/add-auth                    # Feature branch (from main)
    └── feature/add-auth/token-refresh  # Sub-task branch (from feature)
```

## Rules

| Branch Type         | Forks From  | Merges To   | Squash  | Fast-Forward |
| ------------------- | ----------- | ----------- | ------- | ------------ |
| `feature/*`         | `main`      | `main`      | **NO**  | If possible  |
| `feature/*/subtask` | `feature/*` | `feature/*` | **YES** | N/A          |
| `bugfix/*`          | `main`      | `main`      | **NO**  | If possible  |
| `hotfix/*`          | `main`      | `main`      | **NO**  | If possible  |

## Key Principles

1. **Feature branches** fork from `main` and merge back with full history (no squash)
2. **Sub-task branches** fork from parent feature branch and squash-merge back
3. **Main branch** preserves detailed history of all feature work
4. **Fast-forward** merges preferred when branch is cleanly rebased

## Merge Commands

### Feature → Main (NO SQUASH)

```bash
git checkout main
git pull origin main
git merge --no-ff feature/add-auth  # Or --ff-only if rebased
git push origin main
git branch -d feature/add-auth
git push origin --delete feature/add-auth
```

### Sub-task → Feature (SQUASH)

```bash
git checkout feature/add-auth
git merge --squash feature/add-auth/token-refresh
git commit -m "Add token refresh functionality"
git branch -d feature/add-auth/token-refresh
```
