/**
 * The release, in two steps, run on the owner's machine with their own git
 * and `gh` login (README.md, "Release checklist"):
 *
 *   node scripts/release.mjs prepare X.Y.Z
 *     From an up-to-date main: moves the [Unreleased] entries of CHANGELOG.md
 *     under `## [X.Y.Z] - <today>`, updates the compare links, bumps the three
 *     `version` fields and the Shopify theme's `theme_version`, commits
 *     `chore(release): X.Y.Z` on `release/X.Y.Z`, pushes it and opens the
 *     pull request. CI checks it like any other.
 *
 *   node scripts/release.mjs tag X.Y.Z
 *     Once that pull request is merged: checks that main's last commit is it,
 *     then tags it vX.Y.Z and pushes the tag. gh-release.yml publishes the
 *     GitHub Release and deploys, as before.
 *
 * A pull request opened from Actions with GITHUB_TOKEN would start no CI run,
 * and a tag pushed with it no release: both are done here, as the owner.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const REPO_URL = 'https://github.com/mindsersit/mindsers-it'

export const PACKAGES = [
  'packages/design-system/package.json',
  'themes/ghost/package.json',
  'themes/shopify/package.json',
]

// The Shopify theme's version, as the theme editor shows it (`theme_info`)
export const THEME_SCHEMA = 'themes/shopify/config/settings_schema.json'

const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/

export function parseVersion(version) {
  const match = SEMVER.exec(version ?? '')
  if (!match) throw new Error(`"${version}" is not a version (X.Y.Z)`)
  return match
    .slice(1, 4)
    .map(Number)
    .concat(match[4] ?? null)
}

/** Whether `next` comes after `current`. A prerelease comes before its X.Y.Z. */
export function isAfter(next, current) {
  const a = parseVersion(next)
  const b = parseVersion(current)
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]
  if (a[3] === b[3]) return false
  if (a[3] === null) return true
  if (b[3] === null) return false
  return a[3] > b[3]
}

/**
 * A version field (`version` in a package.json, `theme_version` in the theme
 * schema), changed in place: formatting stays.
 */
export function setVersion(json, version, key = 'version') {
  const field = new RegExp(`^(\\s*"${key}":\\s*")([^"]+)(")`, 'm')
  if (!field.test(json)) throw new Error(`no "${key}" field`)
  return json.replace(field, `$1${version}$3`)
}

export function versionOf(json) {
  return JSON.parse(json).version
}

export function themeVersionOf(json) {
  return JSON.parse(json).find(group => group.name === 'theme_info')
    ?.theme_version
}

/**
 * CHANGELOG.md for release `version`: its [Unreleased] entries under a new
 * heading, and the compare links moved on. Refuses an empty [Unreleased].
 */
export function releaseChangelog(text, version, date) {
  const heading = '## [Unreleased]\n'
  const start = text.indexOf(heading)
  if (start < 0) throw new Error('CHANGELOG.md has no "## [Unreleased]"')
  const bodyStart = start + heading.length
  const next = text.indexOf('\n## [', bodyStart)
  const body = text.slice(bodyStart, next < 0 ? undefined : next)
  if (!/^-\s/m.test(body)) {
    throw new Error('CHANGELOG.md has nothing under [Unreleased]')
  }
  if (text.includes(`## [${version}]`)) {
    throw new Error(`CHANGELOG.md already has ${version}`)
  }
  const link = /^\[unreleased\]: .*\/compare\/v(\S+?)\.\.\.HEAD$/m
  const previous = link.exec(text)?.[1]
  if (!previous) throw new Error('CHANGELOG.md has no [unreleased] link')
  return (
    text.slice(0, bodyStart) +
    `\n## [${version}] - ${date}\n` +
    text.slice(bodyStart)
  ).replace(
    link,
    `[unreleased]: ${REPO_URL}/compare/v${version}...HEAD\n` +
      `[${version}]: ${REPO_URL}/compare/v${previous}...v${version}`,
  )
}

/** Whether a commit subject is the release of `version` (squashed or not). */
export function isReleaseSubject(subject, version) {
  return new RegExp(
    `^chore\\(release\\): ${version.replaceAll('.', '\\.')}( \\(#\\d+\\))?$`,
  ).test(subject)
}

const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', ...options }).trim()

const git = (...args) => run('git', args)

function fail(message) {
  console.error(`release: ${message}`)
  process.exit(1)
}

function tagExists(tag) {
  const remote = git('ls-remote', '--tags', 'origin', `refs/tags/${tag}`)
  let local = ''
  try {
    local = git('rev-parse', '--verify', '--quiet', `refs/tags/${tag}`)
  } catch {}
  return remote !== '' || local !== ''
}

function prepare(version) {
  if (git('status', '--porcelain') !== '') fail('the working tree is not clean')
  git('fetch', '--quiet', 'origin', 'main')
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) {
    fail('check out an up-to-date main first (git switch main && git pull)')
  }
  const current = versionOf(readFileSync(PACKAGES[1], 'utf8'))
  if (!isAfter(version, current)) fail(`${version} is not after ${current}`)
  if (tagExists(`v${version}`)) fail(`v${version} already exists`)

  const date = new Date().toISOString().slice(0, 10)
  const changelog = readFileSync('CHANGELOG.md', 'utf8')
  writeFileSync('CHANGELOG.md', releaseChangelog(changelog, version, date))
  for (const path of PACKAGES) {
    writeFileSync(path, setVersion(readFileSync(path, 'utf8'), version))
  }
  const schema = readFileSync(THEME_SCHEMA, 'utf8')
  writeFileSync(THEME_SCHEMA, setVersion(schema, version, 'theme_version'))

  const branch = `release/${version}`
  const title = `chore(release): ${version}`
  git('switch', '--quiet', '-c', branch)
  git(
    'commit',
    '--quiet',
    '-m',
    title,
    'CHANGELOG.md',
    ...PACKAGES,
    THEME_SCHEMA,
  )
  git('push', '--quiet', '-u', 'origin', branch)
  const body = [
    `Release ${version}: CHANGELOG.md, the three \`version\` fields and the Shopify \`theme_version\`.`,
    '',
    `After the merge: \`pnpm release:tag ${version}\` tags it and deploys.`,
  ].join('\n')
  const url = run('gh', [
    'pr',
    'create',
    '--base',
    'main',
    '--head',
    branch,
    '--title',
    title,
    '--body',
    body,
  ])
  console.log(url)
}

function tag(version) {
  git('fetch', '--quiet', 'origin', 'main')
  const subject = git('log', '-1', '--format=%s', 'origin/main')
  if (!isReleaseSubject(subject, version)) {
    fail(
      `main's last commit is "${subject}", not the release of ${version}: ` +
        'merge its pull request, and tag before anything else is merged',
    )
  }
  for (const path of PACKAGES) {
    const found = versionOf(git('show', `origin/main:${path}`))
    if (found !== version) fail(`${path} is ${found} on main, not ${version}`)
  }
  const theme = themeVersionOf(git('show', `origin/main:${THEME_SCHEMA}`))
  if (theme !== version) {
    fail(`${THEME_SCHEMA} is ${theme} on main, not ${version}`)
  }
  if (!git('show', 'origin/main:CHANGELOG.md').includes(`## [${version}]`)) {
    fail(`CHANGELOG.md on main has no ${version}`)
  }
  if (tagExists(`v${version}`)) fail(`v${version} already exists`)
  git('tag', '-a', `v${version}`, '-m', `Release ${version}`, 'origin/main')
  git('push', '--quiet', 'origin', `refs/tags/v${version}`)
  console.log(`v${version} pushed: gh-release.yml releases and deploys it`)
}

if (process.argv[1]?.endsWith('release.mjs')) {
  const [command, version] = process.argv.slice(2)
  try {
    parseVersion(version)
  } catch (error) {
    fail(error.message)
  }
  if (command === 'prepare') prepare(version)
  else if (command === 'tag') tag(version)
  else fail('usage: node scripts/release.mjs prepare|tag X.Y.Z')
}
