# CI minutes

GitHub bills every job rounded up to the minute, on a runner with 2 vCPUs. In
October 2026 the organization used up its Actions budget on the 23rd, and from
then on no check and no release ran in any of its repositories.

The fleet's standard is token-market's
[`docs/ops/ci.md`](https://github.com/mindsersit/token-market/blob/main/docs/ops/ci.md):
ten rules, each with why it is safe. This page says which of them apply here,
how, and which don't, with why.

**This repository is public.** GitHub doesn't bill standard runners for a
public repository: its 77 minutes of October show in the organization's usage
at $0. The rules are kept anyway: they are the fleet's, they cost nothing to
follow, and they would matter the day the repository goes private.

## What runs

| Workflow         | On                                      | Jobs                            |
| ---------------- | --------------------------------------- | ------------------------------- |
| `ci.yml`         | a pull request that is not a draft      | 1 (`verify`)                    |
| `gh-release.yml` | a `v*` tag                              | 1, then `deploy.yml` (1)        |
| `deploy.yml`     | called by `gh-release.yml`, or by hand  | 1 (`deploy`)                    |

## The rules that apply

1. **One job per workflow run.** `ci.yml` was four jobs (`changes`, `lint`,
   `ghost`, `shopify`), each under 40 s and each billed a whole minute. It is
   now one: what changed, `pnpm install` once, Biome, the release script's
   tests, then each theme's build and check when it is concerned.
   - **`deploy.yml`** was one job per theme; it is one job. The Shopify steps
     still run when the Ghost ones failed, as the separate job did.
   - **A release stays two jobs**, `release` and `deploy`. Creating the GitHub
     Release needs `contents: write`; the deploy runs the theme builds'
     dependencies beside the Ghost and Shopify secrets, and keeps the
     read-only token it always had.
2. **`ci` runs on pull requests only.** A newer push to the same pull request
   cancels the run it replaces (`concurrency`), and a draft runs nothing:
   `ready_for_review` starts the gate when the pull request leaves draft.
   `workflow_dispatch` runs everything on any branch, by hand.
3. **`main` is never verified twice.** `ci` no longer runs on a push to `main`:
   a merged pull request's tree is the one its last run checked. That push run
   never gated anything: the deploy starts from a tag, and in October it ran
   beside `CI`, not after it (run 39985360624 started 3 s before release
   39985367720). The deploy builds both themes from the tagged commit, so a
   build that breaks stops it.
   - **The release commit goes through a pull request too.** In October the
     `chore(release): X.Y.Z` commits were pushed straight to `main` (4 of its
     11 commits), and Biome and gscan ran on them only beside the deploy.
     `pnpm release:prepare X.Y.Z` now opens that pull request, and
     `pnpm release:tag X.Y.Z` tags it once merged, only if it is still
     `main`'s last commit (README.md, "Release checklist"). The tree that ships
     is the one its pull request's run checked.
   - token-market's `verified-tree-<tree>` artifact and release `plan` don't
     fit: nothing builds on a push to `main` here, so there is no second
     verification to skip.
4. **A change to documentation only runs nothing.** That is every path a `.md`
   file or under `docs/` (`paths-ignore` in `ci.yml`). GitHub skips the run
   only when every path the whole pull request changes matches, compared with
   its base, not the last push: a documentation commit pushed to a pull
   request that also changes code runs the gate again (run 40107539312, on
   #8).
   - **Why it is safe:** nothing `ci` runs reads them. Biome 2.0.5 has no
     Markdown support and processes no `.md` file. The Ghost build reads
     `styles/`, `scripts/` and the design system; gscan and `shopify theme
     check` check templates, assets and settings.
   - **What reads one:** `gh-release.yml` reads `CHANGELOG.md`, on a tag, not
     in `ci`. The Ghost zip packs every file under `themes/ghost`, a `.md` in
     there included, but only the deploy builds it.
   - **No required status check** is set on `main` today. If one is added, a
     skipped workflow leaves it pending: the docs-only skip then has to move
     into the job, as token-market's `scripts/docs-only.mjs` does.
5. **A change runs the checks of what it touches.** Biome always runs. The
   Ghost theme is built and checked with `gscan --fatal` when `themes/ghost/`
   changes, the Shopify theme with `shopify theme check` when
   `themes/shopify/` changes. Both run when the design system, the lockfile,
   the root's `package.json`, `pnpm-workspace.yaml`, `.node-version` or
   `.github/` change: each theme is built from them. Anything else (`biome.json`,
   `.gitignore`, `.editorconfig`, `scripts/`) runs Biome and the script tests
   only.
6. **Dependency updates are grouped** (rule 9). npm's arrive monthly, the minor
   and patch bumps of the whole workspace in one pull request, majors on their
   own (`.github/dependabot.yml`). Each is one CI run.

## The rules that don't fit

- **6. Database tests on one database per worker:** no database, no test
  suite beyond gscan and theme check.
- **7. and 8. Image builds and their layer cache:** no image. The deploy uploads
  a zip and runs `shopify theme push`.
- **`RUN pnpm fetch` in every Dockerfile:** no Dockerfile.
- **10. A test pays only for what it checks:** no test suite of its own, only
  gscan and theme check, each a whole theme job under 40 s in October.

## What it saved

"Before" is October 2026, measured from its 25 runs
(`gh run list -R mindsersit/mindsers-it --created '>=2026-10-01'`); every job
took under a minute and was billed one. "After" comes from real runs only.

| Workflow and event        | Before                           | After                              | Run         |
| ------------------------- | -------------------------------- | ---------------------------------- | ----------- |
| `CI`, pull request        | 8 runs, 25 jobs, 25 min          | 1 job, 31 s, both themes: 1 min    | 40107449349 |
| `CI`, draft pull request  | ran like any other               | job skipped: 0 min                 | 40107435961 |
| `CI`, push to `main`      | 12 runs, 40 jobs, 40 min         | no longer runs                     |             |
| `CI`, documentation only  | none in October                  | not yet run                        |             |
| `CI`, docs pushed to a PR changing code | ran like any other | 1 job, 31 s: 1 min          | 40107539312 |
| `GitHub Release` + deploy | 4 runs, 10 jobs, 10 min          | not yet run (2 jobs)               |             |
| `Deploy`, by hand         | 1 run, 2 jobs, 2 min             | not yet run (1 job)                |             |
| **Total**                 | **25 runs, 77 min, $0 (public)** |                                    |             |
