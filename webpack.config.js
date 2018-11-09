const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const pkg = require('./package.json');
const BreakingChangeModuleIdentifier = require('./plugins/breaking-change-module-identifier.js');

const config = {
  entry: {
    bundle: './app.js',
    vendor: ['jquery', 'uuid', 'async'],
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  plugins: [      
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: { warnings: false },
      },
      sourceMap: true
    }),
    new BreakingChangeModuleIdentifier()
  ],
  module:{
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  recordsPath: path.join(__dirname, 'records.json')
}

module.exports = config;
