gulp        = require 'gulp'
path        = require 'path'
isProd = ((process.env.NODE_ENV || '').trim().toLowerCase() == 'production')
pkg         = require './package.json'
del         = require 'del'
watch       = require 'gulp-watch'
sourcemaps  = require 'gulp-sourcemaps'
gulpIf      = require 'gulp-if'
fs          = require 'fs'
sftp        = require 'gulp-sftp'
ftpconfig   = JSON.parse(fs.readFileSync('ftpconfig.json', 'utf8'))

image       = require 'gulp-image'
gm          = require 'gulp-gm'
pug         = require 'gulp-pug'
jade        = require 'gulp-jade'
koutoSwiss  = require 'kouto-swiss'
stylus      = require 'gulp-stylus'
coffee      = require 'gulp-coffee'
concat      = require 'gulp-concat'
minifyHtml  = require 'gulp-minify-html'
cssmin      = require 'gulp-cssmin'
uglify      = require 'gulp-uglify'
data        = require 'gulp-data'

# rename      = require 'gulp-rename'
plumber     = require 'gulp-plumber'
browserSync = require 'browser-sync'
notify      = require 'gulp-notify'

srcDir      = './src'
withoutPertial = '!./src/**/_*'
buildDir    = './build'
distDir     = './dist'

src =
  any   : '/**/*'
  html  : '/html/*.html'
  pug   : '/html/*.pug'
  css   : '/css/**/*.css'
  stylus: '/css/**/*.styl'
  js    : '/js/**/*.js'
  coffee: '/js/**/*.coffee'
  tag   : '/tag/**/*'
  img   : '/img/**/*.jpg'
build =
  any   : '/**/*'
  html  : '/'
  css   : '/css'
  js    : '/js'
  tag   : '/tag'
  img   : '/img'
dist =
  any   : '/**/*'
  root  : '/'
for key, value of src
  src[key] = srcDir + value
for key, value of build
  build[key] = buildDir + value
for key, value of dist
  dist[key] = distDir + value

gulp.task 'html',  ->
  gulp.src [src.html, src.pug, withoutPertial]
    .pipe plumber
      errorHandler: notify.onError('<%= error.message %>')
    .pipe gulpIf(/\.pug/, pug
      basedir: 'src/html'
      pretty: true
    )
    .pipe gulpIf isProd, minifyHtml()
    .pipe gulp.dest build.html

gulp.task 'css',  ->
  gulp.src [src.css, src.stylus, withoutPertial]
    .pipe plumber
      errorHandler: notify.onError('<%= error.message %>')
    .pipe gulpIf !isProd, sourcemaps.init
      loadMaps: true
    .pipe gulpIf(/\.styl/, stylus
      use: koutoSwiss())
    .pipe gulpIf isProd, cssmin()
    .pipe gulpIf !isProd, sourcemaps.write '.',
      addComment: true
      sourceRoot: srcDir
    .pipe gulp.dest build.css

gulp.task 'js',  ->
  gulp.src [src.js, src.coffee]
    .pipe plumber
      errorHandler: notify.onError('<%= error.message %>')
    .pipe gulpIf(/\.coffee/, coffee())
    .pipe gulpIf !isProd, sourcemaps.init
      loadMaps: true
    .pipe concat 'app.js'
    .pipe gulpIf isProd, uglify()
    .pipe gulpIf !isProd, sourcemaps.write '.',
      addComment: true
      sourceRoot: srcDir
    .pipe gulp.dest build.js

gulp.task 'img',  ->
  gulp.src src.img
    .pipe plumber
      errorHandler: notify.onError('<%= error.message %>')
    .pipe(gm(((gmfile) ->
      gmfile.resize 1280, 1280
      ), imageMagick: true))
    .pipe do image
    .pipe gulp.dest build.img

gulp.task 'server',  ->
  browserSync
    port: 5678
    server:
      baseDir: buildDir
      index: "index.html"
      middleware: [pugMiddleWare]
gulp.task 'reload', ->
  do browserSync.reload

gulp.task 'clean', ->
  del [dist.any]

gulp.task 'cleanbuild', ->
  del [build.any]

gulp.task 'watch',  ->
  gulp.start ['build']
  # watch [src.html, src.pug], ->
  #   # gulp.start ['html']
  watch [src.css, src.stylus], ->
    gulp.start ['css']
  watch [src.js, src.coffee], ->
    gulp.start ['js']
  watch src.img, ->
    gulp.start ['img']
  watch build.any, ->
    gulp.start ['reload']
  gulp.start ['server']

gulp.task 'build', ['html', 'css', 'js', 'img']

gulp.task 'deploy', ['clean', 'build'], ->
  return gulp.src([
    build.any,
    '!./build/**/*.map'],
    base: buildDir)
    .pipe gulp.dest dist.root
    .pipe sftp(ftpconfig)


gulp.task 'default', ['build']

# MiddleWare for Pug/Stylus
# ============================================================
pugMiddleWare = (req, res, next) ->
  #FIXME: url is undefined
  requestPath = url.parse(req.url).pathname

  # // .html or / で終わるリクエストだけを対象とする
  if (!requestPath.match(/(\/|\.html)$/))
    return next()
  # // HTMLファイルが存在すれば、HTMLを返す
  htmlPath = if path.parse(requestPath).ext == '' then requestPath + 'index.html' else requestPath
  if (fileExists(path.join('src/html', htmlPath)))
    console.info('HTML発見' + htmlPath)
    return next()

  # // pug のファイルパスに変換
  pugPath = path.join('src/', htmlPath.replace('.html', '.pug'))

  # // pugファイルがなければ404を返す
  if (!fileExists(pugPath))
    console.info('Pugファイル見つかりません' + pugPath)
    return next()

  # // pugがファイルを見つけたのでコンパイルする
  content = pug.renderFile(pugPath, {
    basedir: 'src/html'
    compileDebug: true
    pretty: true
    # ...data
  })

  # // コンパイル結果をレスポンスに渡す
  res.end(new Buffer(content))
  next()
