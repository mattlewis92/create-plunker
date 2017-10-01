const webpack = require('webpack');
const WATCH = process.argv.indexOf('--watch') > -1;

module.exports = function(config: any) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      'test/createPlunker.spec.ts'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/createPlunker.spec.ts': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [{
          test: /\.ts$/,
          loader: 'tslint-loader',
          exclude: /node_modules/,
          enforce: 'pre',
          options: {
            emitErrors: !WATCH,
            failOnHint: !WATCH
          }
        }, {
          test: /\.ts$/,
          loader: 'awesome-typescript-loader',
          exclude: /node_modules/
        }, {
          test: /src\/.+\.ts$/,
          exclude: /(test|node_modules)/,
          loader: 'sourcemap-istanbul-instrumenter-loader?force-sourcemap=true',
          enforce: 'post'
        }]
      },
      plugins: [
        ...(WATCH ? [] : [
          new webpack.NoEmitOnErrorsPlugin()
        ])
      ]
    },

    remapIstanbulReporter: {
      reports: {
        html: 'coverage',
        'text-summary': null
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'karma-remap-istanbul'],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: WATCH,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !WATCH
  });
};