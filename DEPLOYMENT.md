Deployment notes for Vercel

Problem
-------
During Vercel builds the Next.js lint step failed with errors like:

  Error: Definition for rule '@typescript-eslint/no-unused-vars' was not found.

This happens when ESLint rules reference `@typescript-eslint` plugin but that package is not installed in the build environment.

Why this happened
-----------------
- Vercel runs a clean install for each deployment. Depending on project settings and NODE_ENV, devDependencies may not be installed during the build.
- The project referenced `@typescript-eslint` rules but those packages were initially declared in devDependencies only, so Vercel's build step could not find them.

What I changed (quick fix)
--------------------------
- Moved these packages from `devDependencies` to `dependencies` in `frontend/package.json` so Vercel installs them during the build:
  - eslint
  - eslint-config-next
  - @typescript-eslint/eslint-plugin
  - @typescript-eslint/parser
  - @rushstack/eslint-patch

This fix makes the build pipelines find the ESLint plugins and prevents the "Definition for rule ... was not found" errors.

Cleaner alternatives (recommended)
---------------------------------
1) Configure Vercel to install devDependencies during build
   - In Project Settings -> General -> Build & Development Settings you can set the Install Command to explicitly install devDependencies.
   - Example install command (use in Vercel settings):

     npm ci --include=dev

   - Or set a custom Build Command that runs:

     npm ci --include=dev; npm run build

   Notes: `npm ci --include=dev` is preferred for CI because it installs exactly what's in the lockfile.

2) Keep packages in devDependencies and skip ESLint during build
   - If you prefer not to install devDependencies in the production build, you can skip linting at build time.
   - Option A (quick): keep `next.config.js` with `eslint.ignoreDuringBuilds = true` (already present in this repo). However, because `vercel.json` currently defines `builds`, Vercel may still run the Next lint step. If you want to guarantee skipping lint, do either:
     - Remove the `builds` entry from `vercel.json` and rely on the default @vercel/next builder (it respects `next.config.js`).
     - Or add a Build Command that runs `next build` directly and ensures env vars are set such that lint isn't invoked.

3) Move only the minimal ESLint plugin packages to dependencies
   - If you don't want all ESLint tooling in production, you can move just `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` (and `eslint-config-next` if needed) to `dependencies`. This keeps the rest of dev tooling in devDependencies.

How to revert the quick fix
--------------------------
1) Move the ESLint packages back to `devDependencies` in `frontend/package.json`.
2) Update Vercel to install devDependencies (see Cleaner alternative #1), or configure Vercel build to skip linting (alternative #2).
3) Run `npm install` locally and push the change.

How I validated
----------------
- Ran `npm install` and `npm run build` locally in `frontend` and verified the Next build completes and pages are prerendered.
- Committed and pushed `frontend/package.json` and `frontend/package-lock.json` changes to `main`.

If you want I can:
- Create a PR instead of direct pushes.
- Revert the change and instead configure Vercel settings to install devDependencies (I can provide the exact command to paste into Vercel).
- Move only the minimum packages back to devDependencies and keep `@typescript-eslint` in `dependencies`.

Pick the option you'd like me to apply and I will implement it.

CI / GitHub Actions deployment
-------------------------------
I added a GitHub Actions workflow at `.github/workflows/vercel-deploy.yml` that builds the `frontend` folder and deploys to Vercel. To use it you need to add three repository secrets in GitHub:

 - `VERCEL_TOKEN` — create a token in Vercel Account Settings → Tokens (read/write deploy token).
 - `VERCEL_ORG_ID` — your Vercel organization ID (from project settings or Vercel dashboard URL).
 - `VERCEL_PROJECT_ID` — your Vercel project ID (from project settings).

After adding these secrets, any push to `main` will trigger the workflow, build `frontend` and deploy to Vercel. This avoids depending on the Root Directory setting in the Vercel UI and is a scalable CI-based approach.