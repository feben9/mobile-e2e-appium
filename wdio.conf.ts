import fs from 'node:fs';
import path from 'node:path';
import { browser } from '@wdio/globals';
import { SevereServiceError } from 'webdriverio';
import { APP } from './src/config/app';
import { env } from './src/config/env';

const reportsDir = path.join(import.meta.dirname, 'reports');
const screenshotsDir = path.join(reportsDir, 'screenshots');
const pageSourceDir = path.join(reportsDir, 'page-source');

const capabilities: WebdriverIO.Capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:app': env.appPath,
  'appium:appPackage': APP.packageId,
  'appium:appActivity': APP.launchActivity,
  'appium:appWaitActivity': APP.readyActivities,
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 240,
  // First runs on a cold CI emulator are slow to install the helper apps.
  'appium:uiautomator2ServerInstallTimeout': 120_000,
  'appium:adbExecTimeout': 60_000,
  ...(env.udid ? { 'appium:udid': env.udid } : {}),
  ...(env.systemPort ? { 'appium:systemPort': env.systemPort } : {}),
};

function fileNameFor(test: { parent: string; title: string }): string {
  return `${test.parent} ${test.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

export const config: WebdriverIO.Config = {
  runner: 'local',
  hostname: env.appiumHost,
  port: env.appiumPort,
  path: '/',

  specs: [env.knownDefects ? './tests/known-defects/**/*.spec.ts' : './tests/**/*.spec.ts'],
  exclude: env.knownDefects ? [] : ['./tests/known-defects/**'],
  suites: {
    smoke: ['./tests/smoke.spec.ts'],
  },

  // One device, one spec file at a time.
  maxInstances: 1,
  capabilities: [capabilities],

  logLevel: 'warn',
  outputDir: path.join(reportsDir, 'wdio-logs'),
  bail: 0,
  // Upper bound for explicit waits (waitForDisplayed, waitUntil, expect matchers).
  waitforTimeout: 15_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 1,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 180_000,
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
      },
    ],
  ],

  onPrepare() {
    if (!fs.existsSync(env.appPath)) {
      throw new SevereServiceError(
        `App not found at ${env.appPath}. Run "npm run fetch-app" or set APP_PATH.`,
      );
    }
    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(pageSourceDir, { recursive: true });
  },

  // On failure keep a screenshot and the UI tree: the tree answers most
  // "why was this element not found" questions without a rerun.
  async afterTest(test, _context, { passed }) {
    if (passed) return;
    const name = fileNameFor(test);
    try {
      await browser.saveScreenshot(path.join(screenshotsDir, `${name}.png`));
      fs.writeFileSync(path.join(pageSourceDir, `${name}.xml`), await browser.getPageSource());
    } catch (error) {
      console.warn(`Could not save failure artifacts for "${test.title}": ${String(error)}`);
    }
  },
};
