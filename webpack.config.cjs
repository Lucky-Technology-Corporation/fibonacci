const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); 

module.exports = {
  entry: './src/main.tsx',
  devServer: {
    static: path.join(__dirname, 'dist'),
    historyApiFallback: true, // this allows routing for react-router
    compress: true,
    port: 3000, // or whatever port you want
    contentBase: path.resolve(__dirname, 'public'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader' },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true  // transpile without type checking
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      //Workers
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    open: true,
    port: 8080,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new MonacoWebpackPlugin({
      languages: ['json', 'javascript', 'css', 'html', 'typescript'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '', noErrorOnMissing: true }
      ]
    })
  ],
  stats: { children: true }
};
