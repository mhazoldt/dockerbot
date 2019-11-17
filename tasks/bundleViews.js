const webpack = require('webpack');
const path = require('path');
const electronViews = ['primary', 'dock'];


const bundleViews = () => {
    const webpackConfigs = [];
    const electronViewsWebpackConfigs = electronViews.map(electronViewsWebpackConfig);

    webpackConfigs.push(...electronViewsWebpackConfigs);
    webpackConfigs.push(mainElectronWebpackConfig());
    const compiler = webpack(webpackConfigs);

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            reject()
            return;
        }

        if(stats) {
          const warningsFilter = [
            '/.node_modules/config/parser.js/',
            './node_modules/config/lib/config.js',
            './node_modules/ws/lib/buffer-util.js',
            './node_modules/ws/lib/validation.js'
          ]

          console.log(stats.toString({colors: true, warningsFilter}));
        }

        resolve()
      })
    })
};

const electronViewsWebpackConfig = (viewName) => {
    return {
        mode: 'development',
        target: 'electron-renderer',
        entry: `./src/views/${viewName}/index.js`,
        output: {
          path: `${process.cwd()}/dev-build/views/${viewName}`,
          filename: 'index.bundle.js'
        },
        module: {
          rules: [
            {
              enforce: 'pre',
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'eslint-loader',
              options: {
                formatter: 'codeframe',
              },
            },
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-react'],
                }
              }
            },
            {
              test: /\.css$/i,
              use: ['style-loader', 'css-loader'],
            },
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx|css)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              }
            }
          ]
        }
      }
}

const mainElectronWebpackConfig = () => {
  return {
      mode: 'development',
      target: 'electron-main',
      entry: `./src/main.js`,
      output: {
        path: `${process.cwd()}/dev-build`,
        filename: 'main.js'
      }
    }
}

// const webViewsWebpackConfig = (viewName) => {
//   return {
//       mode: 'development',
//       target: 'web',
//       entry: `./src/views/${viewName}/index.js`,
//       output: {
//         path: `${process.cwd()}/dev-build/views/${viewName}`,
//         filename: 'index.bundle.js'
//       },
//       module: {
//         rules: [
//           {
//             test: /\.m?js$/,
//             exclude: /(node_modules|bower_components)/,
//             use: {
//               loader: 'babel-loader',
//               options: {
//                 presets: ['@babel/preset-react'],
//               }
//             }
//           },
//           {
//             test: /\.css$/i,
//             use: ['style-loader', 'css-loader'],
//           },
//           {
//             loader: require.resolve('file-loader'),
//             // Exclude `js` files to keep "css" loader working as it injects
//             // its runtime that would otherwise be processed through "file" loader.
//             // Also exclude `html` and `json` extensions so they get processed
//             // by webpacks internal loaders.
//             exclude: [/\.(js|mjs|jsx|ts|tsx|css)$/, /\.html$/, /\.json$/],
//             options: {
//               name: 'static/media/[name].[hash:8].[ext]',
//             }
//           }
//         ]
//       }
//     }
// }

module.exports = bundleViews;