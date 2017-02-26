path = require('path');

// webpack.config.js
module.exports =  {
  entry: [
    // Set up an ES6-ish environment
    'babel-polyfill',
    './src/uif.es6',
  ],
  output: {
    filename: 'dist/uif.js'
  },
  resolve: {
    extensions: ['.js', '.es6']
  },

  devtool: 'source-map',

  module: {
    loaders: [
      {
        loader: 'babel-loader',

        // Skip any files outside of your project's `src` directory
        include: [
          path.resolve(__dirname, "src"),
        ],

        // Only run `.js` and `.jsx` files through Babel
        test: /\.es6$/,
        // test: /\.js$/,

        // exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}
