# Git Sync & Fix Guide (GH013)

The error `GH013` usually means you are violating a **Repository Rule**, often "Do not allow bypassing the above settings" or "Restrict pushes" (Branch Protection).

## Step 1: Commit Your Local Changes
You have uncommitted changes in `GoogleLoginButton.tsx`. Let's save them first.
```bash
git add .
git commit -m "fix: improve google login error reporting"
```

## Step 2: Push to Your Feature Branch
Do **not** push directly to `development` if it is protected. Push to your feature branch first.
```bash
git push origin feature/google-map-restoration
```

## Step 3: Create a Pull Request (PR)
Since you encountered `GH013`, direct pushes to `development` are likely blocked.
1. Go to your GitHub repository.
2. You should see "feature/google-map-restoration had recent pushes". Click **Compare & pull request**.
3. Base: `development`, Compare: `feature/google-map-restoration`.
4. Create and Merge the PR.

## Step 4: Sync Main with Development
Once `development` is up to date (after merging your PR):

```bash
# Checkout main
git checkout main

# Pull latest main (just in case)
git pull origin main

# Merge development into main
git merge development

# Push to main
# (If main is also protected, you might need to make a PR from development -> main instead)
git push origin main
```

> [!TIP]
> If `git push origin main` also fails with GH013, you **must** go to GitHub and create a PR from `development` to `main` to sync them.
