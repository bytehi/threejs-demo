const webpack = require('webpack')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpackCommonConf = require('./webpack.common')
const path = require('path')

const isAnalyzer = process.env.NODE_ENV === 'production_analyzer'

const plugins = [
  new webpack.DefinePlugin({
    ENV: JSON.stringify('production')
  }),
  new CleanWebpackPlugin()
]

if(isAnalyzer) {
  plugins.push(new BundleAnalyzerPlugin())
}


module.exports = merge(webpackCommonConf, {
  mode: 'production',
  output: {
    filename: 'index.[contenthash:8].js',
    path: path.join(__dirname, '..', 'dist')
  },
  plugins,
  devtool: 'source-map'
})
