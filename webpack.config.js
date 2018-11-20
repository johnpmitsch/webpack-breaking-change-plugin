const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const pkg = require('./package.json');
const BreakingChangeModuleIdentifier = require('./plugins/breaking-change-module-identifier.js');
const SimpleNamedModules = require('./plugins/simple_named_modules.js');

const config = {
  entry: {
    bundle: './app.js',
    vendor: ['my-meta-package'],
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, '.')
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
    new SimpleNamedModules()
    //new BreakingChangeModuleIdentifier()
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
