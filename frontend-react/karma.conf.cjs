module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],

    plugins: [
      require('karma-jasmine'),
      require('karma-typescript')
    ],

    files: [
      { pattern: 'src/**/*.ts' },
      { pattern: 'src/**/*.tsx' }
    ],

    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
      'src/**/*.tsx': ['karma-typescript']
    },

    karmaTypescriptConfig: {
      compilerOptions: {
        jsx: 'react-jsx',
        module: 'commonjs',
        target: 'es2020',
        esModuleInterop: true
        
      }
    },

    reporters: ['progress'],

    browsers: [],
    singleRun: true
  });
};