const path = require('path');
const bundlePath = path.resolve("../out/public");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/static", to: bundlePath }
      ]
    })
  ],
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: bundlePath
  },
  devServer: {
    proxy: {
      '/api': 'http://localhost:3033',
    },
  },
  mode: process.env.MODE
};