const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENV = process.env.npm_lifecycle_event;
const isDev = ENV === 'dev';
const isProd = ENV === 'build';

function setDevTool() {
  if (isDev) {
    return 'cheap-module-eval-source-map';
  }
  return 'none';
}

function setDMode() {
  if (isProd) {
    return 'production';
  }
  return 'development';
}

const config = {
  target: 'web',
  entry: { index: './src/main.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    alias: {
      images: path.resolve(__dirname, 'assets/img/'),
    },
  },
  mode: setDMode(),
  devtool: setDevTool(),
  module: {
    rules: [{
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: false,
        },
      }],
    },
    {
      test: /\.js$/,
      use: ['babel-loader'/* , 'eslint-loader' */],
      exclude: [
        /node_modules/,
      ],
    },
    {
      test: /\.css$/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        }, 
      ],
    },
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    },
    {
      test: /\.(jpe?g|png|svg|gif)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: 'img',
            name: 'assets/img/[name].[ext]',
          },
        },
        {
          loader: 'image-webpack-loader',
          options: {
            bypassOnDebug: true,
            mozjpeg: {
              progressive: true,
              quality: 75,
            },
            // optipng.enabled: false will disable optipng
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: [0.65, 0.90],
              speed: 4,
            },
            gifsicle: {
              interlaced: false,
              optimizationLevel: 1,
            },
          },
        },
      ],
    },
    {
      test: /\.(woff|woff2|ttf|otf|eot)$/,
      use: [{
        loader: 'file-loader',
        options: {
          outputPath: 'fonts',
        },
      }],
    },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new CopyWebpackPlugin([
      {from: './src/assets', to: './assets'},
      // {from: './src/img', to: './img/'},
    ]),
  ],

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    overlay: true,
    stats: 'errors-only',
    clientLogLevel: 'none',
  },
};

module.exports = config;
