const path = require('path')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopywebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const UglifyJS = require('uglify-js')

module.exports = (env, options) => {
  function optimization(content, path) {
    if (options.mode === 'production' && /\.js$/.test(path)) {
      const result = UglifyJS.minify(content.toString())
      if (!result.error) return result.code
    }
    return content
  }

  return {
    context: __dirname,
    devtool: 'cheap-source-map',
    entry: {
      bimfishModelo: './src/index.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      sourcePrefix: ''
    },
    module: {
      unknownContextCritical: false,
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
          use: ['url-loader']
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: [
            {
              loader: 'strip-pragma-loader',
              options: {
                pragmas: {
                  debug: false
                }
              }
            }
          ]
        },
        {
          test: /\.wasm$/,
          use: [
            {
              loader: 'wasm-loader'
            }
          ]
        },
        {
          test: /\.json$/i,
          type: 'javascript/auto',
          loader: 'json-loader'
        }
      ]
    },
    amd: {
      toUrlUndefined: true
    },
    node: {
      fs: 'empty'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      }),
      new CopywebpackPlugin([
        {
          from: './SampleData',
          to: 'SampleData'
        },
        {
          from: './images',
          to: 'images'
        },
        {
          from: './lib',
          to: 'lib'
        },
        {
          from: './assets',
          to: 'assets'
        }
      ]),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('')
      }),
      ...(options.mode === 'production' ? [] : [])
    ],
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      port: 8089
    },
    resolve: {
      alias: {}
    },
    optimization: {
      // minimize: true,
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }
  }
}
