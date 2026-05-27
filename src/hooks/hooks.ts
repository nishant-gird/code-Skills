import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { APIClient } from '../api/httpClient';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { ITestContext } from '../utils/types';
import { setupAdBlockingRoutes } from '../utils/helpers';
import * as fs from 'fs';
import * as path from 'path';

setDefaultTimeout(config.timeout);

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let apiClient: APIClient | null = null;

// Global test context accessible from step definitions
export const testContext: ITestContext = {
  page: null,
  apiClient: null
};

/**
 * Before hook: Initialize browser and API client
 */
Before(async function() {
  try {
    logger.info('Starting test execution');

    // Initialize browser and context
    browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo
    });

    context = await browser.newContext();
    page = await context.newPage();

    // Setup ad-blocking routes
    await setupAdBlockingRoutes(page);

    // Initialize API client
    apiClient = new APIClient();
    await apiClient.initialize(page);

    // Update global test context
    testContext.page = page;
    testContext.apiClient = apiClient;

    // Attach to Cucumber World for step definitions
    this.page = page;
    this.apiClient = apiClient;
    this.context = context;
    this.browser = browser;

    logger.info('Browser and API client initialized with ad blocking');
  } catch (error) {
    logger.error('Before hook failed', error);
    throw error;
  }
});

/**
 * After hook: Cleanup and capture artifacts
 */
After(async function(scenario) {
  try {
    // Capture screenshot and trace on failure
    if (scenario.result?.status === 'FAILED') {
      logger.warn(`Test failed: ${scenario.pickle.name}`);

      if (page) {
        // Capture screenshot
        const screenshotPath = path.join(
          'allure-results',
          `screenshot-${Date.now()}.png`
        );

        if (!fs.existsSync('allure-results')) {
          fs.mkdirSync('allure-results', { recursive: true });
        }

        await page.screenshot({ path: screenshotPath });
        logger.info(`Screenshot saved: ${screenshotPath}`);

        // Attach to Allure (would need allure-js library for full integration)
      }
    }

    // Cleanup
    if (context) {
      await context.close();
    }

    if (browser) {
      await browser.close();
    }

    logger.info('Test execution completed');
  } catch (error) {
    logger.error('After hook failed', error);
  } finally {
    // Reset global references
    browser = null;
    context = null;
    page = null;
    apiClient = null;
    testContext.page = null;
    testContext.apiClient = null;
  }
});
