const webpack = require('webpack')
const { merge } = require('webpack-merge')
const webpackCommonConf = require('./webpack.common.js')

module.exports = merge(webpackCommonConf, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('development')
    })
  ],
  devServer: {
    port: 1234,
    compress: true, // 启动gzip压缩
  },
  devtool: 'eval-cheap-source-map'
})
