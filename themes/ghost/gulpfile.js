const { series, watch, src, dest, parallel } = require('gulp')
const pump = require('pump')

// gulp plugins and utils
const livereload = require('gulp-livereload')
const postcss = require('gulp-postcss')
const zip = require('gulp-zip').default
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')(require('sass'))

// postcss plugins
const autoprefixer = require('autoprefixer')
const colorFunction = require('postcss-color-mod-function')
const cssnano = require('cssnano')
const easyimport = require('postcss-easy-import')

// shared styles, scripts and fonts (also used by the Shopify theme)
const DS = '../../packages/design-system'

function serve(done) {
  livereload.listen()
  done()
}

const handleError = done => {
  return err => {
    return done(err)
  }
}

function templates(done) {
  pump(
    [src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']), livereload()],
    handleError(done),
  )
}

function styles(done) {
  const processors = [easyimport, colorFunction(), autoprefixer(), cssnano()]

  pump(
    [
      src('styles/*.scss', { sourcemaps: true }),
      sass({ outputStyle: 'compressed', loadPaths: [`${DS}/scss`] }).on(
        'error',
        sass.logError,
      ),
      postcss(processors),
      dest('assets/css/', { sourcemaps: '.' }),
      livereload(),
    ],
    handleError(done),
  )
}

function scripts(done) {
  pump(
    [
      src(['scripts/*.js', `${DS}/js/*.js`], { sourcemaps: true }),
      uglify(),
      dest('assets/js/', { sourcemaps: '.' }),
      livereload(),
    ],
    handleError(done),
  )
}

function fonts(done) {
  pump(
    [src(`${DS}/fonts/*`, { encoding: false }), dest('assets/fonts/')],
    handleError(done),
  )
}

function zipper(done) {
  const targetDir = 'dist/'
  const themeName = require('./package.json').name
  const filename = `${themeName}.zip`

  pump(
    [
      src(['**', '!node_modules', '!node_modules/**', '!dist', '!dist/**'], {
        encoding: false,
      }),
      zip(filename),
      dest(targetDir),
    ],
    handleError(done),
  )
}

const stylesWatcher = () => watch(['styles/**', `${DS}/scss/**`], styles)
const scriptsWatcher = () => watch(['scripts/**', `${DS}/js/**`], scripts)
const templatesWatcher = () =>
  watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], templates)
const watcher = parallel(scriptsWatcher, stylesWatcher, templatesWatcher)
const build = parallel(styles, scripts, fonts)
const dev = series(build, serve, watcher)

exports.build = build
exports.zip = series(build, zipper)
exports.default = dev
