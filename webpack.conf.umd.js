var webpack = require('webpack')

module.exports = {
  entry: ['./vue-modal.common.js'],
  output: {
    path: __dirname,
    filename: 'vue-modal.js',
    libraryTarget: 'umd',
    library: '@citygro/vue-modal'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: [/node_modules/] }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  ]
}
