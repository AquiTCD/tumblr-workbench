var webpack = require('webpack');
var path = require('path');
var saveLicense = require('uglify-save-license');

module.exports = {
  entry: {
    app: './src/js/app.ts'
  },
  output: {
    path: path.join(__dirname, 'build/js'),
    filename: 'bundle.js'
  },
  resolve: {
    modules: [path.join(__dirname, 'node_modules'), path.join(__dirname, 'src/js/modules')],
    extensions: ['.ts', '.webpack.js', '.web.js', '.js'],
    alias: { 'videojs-contrib-hls': 'videojs-contrib-hls/dist/videojs-contrib-hls.min' }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: ['ts-loader']
    }, {
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   output: {
    //     comments: saveLicense
    //   }
    // }),
    // new webpack.SourceMapDevToolPlugin({
    //   filename: null, // if no value is provided the sourcemap is inlined
    //   test: /\.(ts|js)($|\?)/i // process .js and .ts files only
    // }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      objectFitImages: 'object-fit-images',
      videojs: 'video.js'
    })
  ],
  devtool: 'source-map'
}
