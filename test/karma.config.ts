// This file is named differently than its JS bootstrapper to avoid the ts compiler to overwrite it.

import path = require('path');
import {
  customLaunchers,
  platformMap,
} from './browser-providers.ts';


export function config(config) {
  config.set({
    basePath: path.join(__dirname, '..'),
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-browserstack-launcher'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sauce-launcher'),
    ],
    files: [
      {pattern: 'node_modules/es6-shim/es6-shim.js', included: true, watched: true},
      {pattern: 'node_modules/angular2/bundles/angular2-polyfills.js', included: true,
          watched: true},
      {pattern: 'node_modules/systemjs/dist/system-polyfills.js', included: true, watched: true},
      {pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: true},
      {pattern: 'node_modules/rxjs/bundles/Rx.js', included: true, watched: true},
      {pattern: 'node_modules/angular2/bundles/angular2.js', included: true, watched: true},
      {pattern: 'node_modules/angular2/bundles/testing.dev.js', included: true, watched: true},

      {pattern: 'test/karma-test-shim.js', included: true, watched: true},

      // paths loaded via module imports
      {pattern: 'dist/**/*.js', included: false, watched: true},

      // paths loaded via Angular's component compiler
      // (these paths need to be rewritten, see proxies section)
      {pattern: 'dist/**/*.html', included: false, watched: true},
      {pattern: 'dist/**/*.css', included: false, watched: true},

      // paths to support debugging with source maps in dev tools
      {pattern: 'dist/**/*.ts', included: false, watched: false},
      {pattern: 'dist/**/*.js.map', included: false, watched: false}
    ],
    proxies: {
      // required for component assests fetched by Angular's compiler
      '/demo-app/': '/base/dist/demo-app/',
      '/components/': '/base/dist/components/',
      '/core/': '/base/dist/core/',
      '/directives/': '/base/dist/directives/',
    },

    customLaunchers: customLaunchers,

    exclude: [],
    preprocessors: {},
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    sauceLabs: {
      testName: 'material2',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      options: {
        'selenium-version': '2.48.2',
        'command-timeout': 600,
        'idle-timeout': 600,
        'max-duration': 5400
      }
    },

    browserStack: {
      project: 'material2',
      startTunnel: false,
      retryLimit: 1,
      timeout: 600,
      pollingTimeout: 10000
    },

    browsers: ['Chrome'],

    singleRun: false
  });

  if (process.env['TRAVIS']) {
    var buildId = `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`;

    // The MODE variable is the indicator of what row in the test matrix we're running.
    // It will look like <platform>_<alias>, where platform is one of 'saucelabs' or 'browserstack',
    // and alias is one of the keys in the CIconfiguration variable declared in
    // browser-providers.ts.
    let [platform, alias] = process.env.MODE.split('_');

    if (platform == 'saucelabs') {
      config.sauceLabs.build = buildId;
      config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

      // TODO(mlaval): remove once SauceLabs supports websockets.
      // This speeds up the capturing a bit, as browsers don't even try to use websocket.
      console.log('>>>> setting socket.io transport to polling <<<<');
      config.transports = ['polling'];
    } else if (platform == 'browserstack') {
      config.browserStack.build = buildId;
      config.browserStack.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
    } else {
      throw new Error(`Platform "${platform}" unknown, but Travis specified. Exiting.`);
    }

    config.browsers = platformMap[platform][alias.toUpperCase()];
  }
};
