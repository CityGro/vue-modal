'use strict';

module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  },
  output: {
    library: 'vue-modal',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  }
};
