const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
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
    path: path.resolve("../dist/public")
  },
  devServer: {
      proxy: {
          '/api/v1': 'http://localhost:3000'
      },
      static: {
          directory: path.resolve("../dist/public")
      }
  },
  mode: process.env.MODE
};