const { series, watch, src, dest, parallel } = require('gulp')
const { spawn } = require('node:child_process')
const pump = require('pump')

// gulp plugins
const postcss = require('gulp-postcss')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')(require('sass'))

// postcss plugins
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

// shared styles, scripts and fonts (also used by the Ghost theme)
const DS = '../../packages/design-system'

// Shopify serves assets/ as one flat folder, so everything is written there
// without subfolders. No source maps: they aren't useful on Shopify's CDN.
const OUT = 'assets/'

// in watch mode, log Sass errors and keep watching; otherwise fail the build
let watching = false

const handleError = done => {
  return err => {
    return done(err)
  }
}

function styles(done) {
  const compile = sass({ outputStyle: 'compressed', loadPaths: [`${DS}/scss`] })

  pump(
    [
      src('src/styles/*.scss'),
      watching ? compile.on('error', sass.logError) : compile,
      postcss([autoprefixer(), cssnano()]),
      dest(OUT),
    ],
    handleError(done),
  )
}

function scripts(done) {
  pump(
    [src(['src/scripts/*.js', `${DS}/js/*.js`]), uglify(), dest(OUT)],
    handleError(done),
  )
}

function fonts(done) {
  pump(
    [src(`${DS}/fonts/*`, { encoding: false }), dest(OUT)],
    handleError(done),
  )
}

function startWatching(done) {
  watching = true
  done()
}

// Runs `shopify theme dev`, which uploads every change to assets/ (including
// the files the watchers rebuild) to a development theme and serves a preview.
function themeDev(done) {
  const cli = spawn('shopify', ['theme', 'dev', '--path', '.'], {
    stdio: 'inherit',
  })
  cli.on('error', done)
  cli.on('exit', code =>
    done(code ? new Error(`shopify theme dev exited with ${code}`) : undefined),
  )
}

const stylesWatcher = () => watch(['src/styles/**', `${DS}/scss/**`], styles)
const scriptsWatcher = () => watch(['src/scripts/**', `${DS}/js/**`], scripts)
const build = parallel(styles, scripts, fonts)

exports.build = build
exports.default = series(
  build,
  startWatching,
  parallel(stylesWatcher, scriptsWatcher, themeDev),
)
