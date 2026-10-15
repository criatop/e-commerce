module.exports = (config) => {
  config.set({
    frameworks: ['jasmine', 'webpack'],
    plugins: ['karma-jasmine', 'karma-webpack', 'karma-chrome-launcher'],
    files: [
      'src/test-setup.ts',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],
    preprocessors: {
      'src/test-setup.ts': ['webpack'],
      'src/**/*.spec.ts': ['webpack'],
      'src/**/*.spec.tsx': ['webpack'],
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: { loader: 'babel-loader' },
          },
        ],
      },
      stats: 'errors-only',
    },
    webpackMiddleware: { noInfo: true },
    reporters: ['progress'],
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },
    singleRun: true,
    autoWatch: false,
    concurrency: 1,
  });
};
