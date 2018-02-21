const webpack = require('webpack');
const config = require('./webpack.config.js');

config.plugins.push(
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.DefinePlugin({ // <-- key to reducing React's size
   'process.env.NODE_ENV': '"production"'
  })
);

module.exports = config;
