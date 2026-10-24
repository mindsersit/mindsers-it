import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  isAfter,
  isReleaseSubject,
  PACKAGES,
  parseVersion,
  releaseChangelog,
  setVersion,
  versionOf,
} from './release.mjs'

const CHANGELOG = `# Changelog

## [Unreleased]

### Added

-   A thing

## [2.1.0] - 2026-10-23

### Fixed

-   Another

[unreleased]: https://github.com/mindsersit/mindsers-it/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/mindsersit/mindsers-it/compare/v2.0.2...v2.1.0
`

test('a version is X.Y.Z, with an optional prerelease', () => {
  assert.deepEqual(parseVersion('2.1.0'), [2, 1, 0, null])
  assert.deepEqual(parseVersion('3.0.0-rc.1'), [3, 0, 0, 'rc.1'])
  for (const bad of ['v2.1.0', '2.1', '', undefined, '2.1.0; rm']) {
    assert.throws(() => parseVersion(bad))
  }
})

test('the next version comes after the current one', () => {
  assert.equal(isAfter('2.1.1', '2.1.0'), true)
  assert.equal(isAfter('2.10.0', '2.9.0'), true)
  assert.equal(isAfter('3.0.0', '2.9.9'), true)
  assert.equal(isAfter('2.1.0', '2.1.0'), false)
  assert.equal(isAfter('2.0.9', '2.1.0'), false)
  assert.equal(isAfter('3.0.0', '3.0.0-rc.1'), true)
  assert.equal(isAfter('3.0.0-rc.1', '3.0.0'), false)
})

test('the version field changes and nothing else', () => {
  const json = '{\n  "name": "x",\n  "version": "2.1.0",\n  "a": "2.1.0"\n}\n'
  const out = setVersion(json, '2.2.0')
  assert.equal(out, json.replace('"version": "2.1.0"', '"version": "2.2.0"'))
  assert.equal(versionOf(out), '2.2.0')
  assert.throws(() => setVersion('{}', '2.2.0'))
})

test("the repository's three packages have a version field", () => {
  for (const path of PACKAGES) {
    const json = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
    assert.equal(versionOf(setVersion(json, '9.9.9')), '9.9.9', path)
  }
})

test('the [Unreleased] entries move under the new version', () => {
  const out = releaseChangelog(CHANGELOG, '2.2.0', '2026-10-25')
  assert.match(
    out,
    /## \[Unreleased\]\n\n## \[2\.2\.0\] - 2026-10-25\n\n### Added\n\n- {3}A thing\n\n## \[2\.1\.0\]/,
  )
  assert.match(
    out,
    /^\[unreleased\]: https:\/\/github\.com\/mindsersit\/mindsers-it\/compare\/v2\.2\.0\.\.\.HEAD\n\[2\.2\.0\]: https:\/\/github\.com\/mindsersit\/mindsers-it\/compare\/v2\.1\.0\.\.\.v2\.2\.0\n\[2\.1\.0\]:/m,
  )
})

test('an empty [Unreleased] or a version already there is refused', () => {
  const empty = CHANGELOG.replace('### Added\n\n-   A thing\n\n', '')
  assert.throws(() => releaseChangelog(empty, '2.2.0', '2026-10-25'), /nothing/)
  assert.throws(
    () => releaseChangelog(CHANGELOG, '2.1.0', '2026-10-25'),
    /already/,
  )
})

test("the repository's own CHANGELOG.md can be released", () => {
  const text = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')
  const hasEntries = /## \[Unreleased\]\n+(?:###[^\n]*\n+)?-\s/.test(text)
  if (!hasEntries) return
  assert.match(
    releaseChangelog(text, '99.0.0', '2026-10-25'),
    /## \[99\.0\.0\]/,
  )
})

test('the release commit is recognised, squashed or not', () => {
  assert.equal(isReleaseSubject('chore(release): 2.2.0', '2.2.0'), true)
  assert.equal(isReleaseSubject('chore(release): 2.2.0 (#9)', '2.2.0'), true)
  assert.equal(isReleaseSubject('chore(release): 2.2.01', '2.2.0'), false)
  assert.equal(isReleaseSubject('chore(release): 2x2x0', '2.2.0'), false)
  assert.equal(isReleaseSubject('feat: x (#10)', '2.2.0'), false)
})
