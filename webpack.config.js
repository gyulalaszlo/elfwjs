'use strict';

var path = require('path');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

// webpack.config.js
module.exports =  {
  entry: [
    // Set up an ES6-ish environment
    'babel-polyfill',
    './elfw.es6',
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'elfw.min.js',
  },
  resolve: {
    extensions: ['.js', '.es6']
  },

  devtool: 'source-map',

  module: {
    loaders: [
      {
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, "src"),
        ],
        test: /\.es6$/,
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['env', 'es2015']
        }
      },
    ]
  },

  plugins: [
    new ClosureCompilerPlugin({
      compiler: {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        compilation_level: 'ADVANCED'
      },
      concurrency: 3,
    })
  ]


}
