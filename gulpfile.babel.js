import gulp           from 'gulp'
import browserSync    from 'browser-sync'
import * as path from "path";
import * as fs from "fs";
import {argv as argv} from 'yargs';
import del            from 'del'
import watch          from 'gulp-watch'
import sourcemaps     from 'gulp-sourcemaps'
import gulpIf         from 'gulp-if'
import image          from 'gulp-image'
import changed        from 'gulp-changed'
import imageResize    from 'gulp-image-resize'
import pug            from 'gulp-pug'
// import markdownIt     from 'jstransformer-markdown-it'
import koutoSwiss     from 'kouto-swiss'
import stylus         from 'gulp-stylus'
import replace        from 'gulp-replace'
import download       from 'gulp-downloader'
import fileInclude    from 'gulp-file-include'
import checkFilesize  from 'gulp-check-filesize'
import data           from 'gulp-data'
import plumber        from 'gulp-plumber'
import runSequence    from 'run-sequence'
import notify         from 'gulp-notify'
const pkg            = require('./package.json');
const isProduction   = ((process.env.NODE_ENV || '').trim().toLowerCase() == 'production');
const theme          = argv.theme ? argv.theme : 'default';
const bsConfig       = require('./bs-config.js');
const withoutPartial = '!./src/**/_*';
const srcDir         = './src';
const src = {
  any:   `${srcDir}/**/*`,
  html:  `${srcDir}/html/**/*.{html,pug}`,
  css:   `${srcDir}/css/**/*.{css,styl}`,
  tag:   `${srcDir}/tag/**/*.tag`,
  img:   `${srcDir}/img/**/*.{png,jpg,svg,gif}`,
  assets: {
    css: `${srcDir}/assets/css/*`,
    img: `${srcDir}/assets/img/*`
  }
};
const buildDir    = './build';
const build = {
  any:  `${buildDir}/**/*`,
  html: `${buildDir}`,
  css:  `${buildDir}/css`,
  js:   `${buildDir}/js`,
  tag:  `${buildDir}/tag`,
  img:  `${buildDir}/img`,
  font: `${buildDir}/font`
};
const fontUrl    = {
  cdn:      'https://cdn.jsdelivr.net/npm/yakuhanjp',
  version:  '@2.0.0',
  distDir:  'dist',
  cssDir:   'css',
  cssFile:  'yakuhanjp.min.css',
  fontDir:  'fonts',
  fontName: 'YakuHanJP'
};
const distDir     = './dist';
const buildTasks  = ['html', 'css', 'img']
const beforeBuild = ['font', 'assets']
// HTML
// ------------------------------------------------------------
gulp.task('html', () => {
  return gulp.src([src.html, withoutPartial])
    .pipe(gulpIf(!isProduction, plumber({errorHandler: notify.onError('html: <%= error.message %>')})))
    .pipe(gulpIf(isProduction,
      data(function(file) { return {t: require('./src/data/tumblr_production.json')}}),
      data(function(file) { return {t: require('./src/data/tumblr_development.json')}})))
    .pipe(data(function(file) { return {settings: require('./src/data/settings.json')}}))
    .pipe(gulpIf(/\.pug/, pug({
        basedir: './src/html/',
        pretty: !isProduction,
        locals: {'isProduction': isProduction,
                 'theme': theme}
    })))
    .pipe(gulp.dest(build.html));
});
// CSS
// ------------------------------------------------------------
gulp.task('css', () => {
  return gulp.src([src.css, withoutPartial])
    .pipe(gulpIf(!isProduction, plumber({errorHandler: notify.onError('css: <%= error.message %>')})))
    .pipe(gulpIf(!isProduction, sourcemaps.init({loadMaps: true})))
    .pipe(gulpIf(/\.styl/, stylus({
      use: koutoSwiss(),
      compress: isProduction,
      define: {'$theme': theme},
      'include css': true
    })))
    .pipe(gulpIf(!isProduction, sourcemaps.write('.', {
      addComment: true,
      sourceRoot: './src'
    })))
    .pipe(gulp.dest(build.css));
});
// Image
// ------------------------------------------------------------
gulp.task('img', () => {
  return gulp.src(src.img)
    .pipe(gulpIf(!isProduction, plumber({errorHandler: notify.onError('img: <%= error.message %>')})))
    .pipe(changed(build.img))
    .pipe(imageResize({width:1280, height:1280,imageMagick:true}))
    .pipe(image())
    .pipe(gulp.dest(build.img));
});
// Font
// ------------------------------------------------------------
gulp.task('font', () => {
  return download({
      fileName: 'yakuhan.css',
      request: {
        url: `${fontUrl.cdn}${fontUrl.version}/${fontUrl.distDir}/${fontUrl.cssDir}/${fontUrl.cssFile}`
      }
    })
    .pipe(gulpIf(!isProduction, plumber({errorHandler: notify.onError('font: <%= error.message %>')})))
    .pipe(replace('../fonts/', `${fontUrl.cdn}${fontUrl.version}/${fontUrl.distDir}/${fontUrl.fontDir}/`))
    .pipe(gulp.dest(`${build.css}/plugins`));
});
// Copy
// ------------------------------------------------------------
// TODO:このソースもsettingsに書きたい
gulp.task('assets_css', () => {
  return gulp.src([src.assets.css])
    .pipe(gulpIf(!isProduction, plumber({errorHandler: notify.onError('assets: <%= error.message %>')})))
    .pipe(gulp.dest(`${build.css}/plugins`));
});
gulp.task('assets_img', () => {
  return gulp.src(src.assets.img)
    .pipe(gulpIf(!isProduction, plumber({errorHandler: notify.onError('assets: <%= error.message %>')})))
    .pipe(gulp.dest(build.img));
});
gulp.task('assets', ['assets_css', 'assets_img']);
// Server, Reload, Watch
// ------------------------------------------------------------
gulp.task('server', () => {
  return browserSync(bsConfig);
});

gulp.task('reload', () => {
  return browserSync.reload();
});

gulp.task('watch', () => {
  watch(src.html, () => { return runSequence('html', 'reload')});
  watch(src.css, () => { return runSequence('css', 'reload')});
  watch(src.img, () => { return runSequence('img', 'reload')});
});
// Build and Deploy
// ------------------------------------------------------------
gulp.task('clean', () => {
  return del([`${buildDir}/*`, `${distDir}/*`]);
})
gulp.task('build', (callback) => {
  runSequence(beforeBuild, buildTasks, callback);
});
gulp.task('bind', () => {
  // NOTE: 疎結合にしたい
  return gulp.src(['./build/**/*.html', './build/css/style.css', './build/img/*', './build/font/*'], {base: buildDir})
  .pipe(gulpIf(/\.css/, checkFilesize({ fileSizeLimit: 50000 })))
  .pipe(gulpIf(/\.html/, fileInclude({
      prefix: '@@',
      basepath: buildDir
    })))
  .pipe(gulp.dest(distDir))
});
gulp.task('organize', () => {
  return del([`${distDir}/css`, `${distDir}/**/*.html`, `!${distDir}/dist.html` ]);
})
gulp.task('release', (callback) => {
  runSequence('clean', 'build', 'bind', 'organize', 'msg', callback);
});
gulp.task('msg', () => {
  console.log('No error release build, YEY! :+1:');
});
gulp.task('default', ['build'], () => {
  return gulp.start(['watch', 'server'])
});
