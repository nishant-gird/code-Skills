import { Page, Locator } from 'playwright';
import { logger } from './logger';
import { ITestContext, IAPIResponse } from './types';

// ============================================================================
// LOCATOR HELPERS
// ============================================================================

/**
 * Resolves a Locator or string selector to a Locator object
 */
export function resolveLocator(locatorOrSelector: Locator | string, page: Page): Locator {
  return typeof locatorOrSelector === 'string' ? page.locator(locatorOrSelector) : locatorOrSelector;
}

/**
 * Builds a locator with has-text selector
 */
export function buildHasTextLocator(baseSelector: string, text: string): string {
  const escapedText = text.replace(/"/g, '\\"');
  return `${baseSelector}:has-text("${escapedText}")`;
}

/**
 * Builds a product selector by name
 */
export function buildProductSelector(productName: string, context: 'grid' | 'cart' = 'grid'): string {
  const escapedName = productName.replace(/"/g, '\\"');
  return context === 'grid'
    ? buildHasTextLocator('.productinfo', escapedName)
    : buildHasTextLocator('.cart_menu_bottom', escapedName);
}

/**
 * Builds a filter selector for brand or category
 */
export function buildFilterSelector(filterName: string, filterType: 'brand' | 'category'): string {
  const escapedName = filterName.replace(/"/g, '\\"');
  return filterType === 'brand'
    ? buildHasTextLocator('.left-indent', escapedName)
    : buildHasTextLocator('.categoryblock a', escapedName);
}

// ============================================================================
// CONTEXT VALIDATION HELPERS
// ============================================================================

/**
 * Ensures page context is initialized, throws if not
 */
export function ensurePageContext(testContext: ITestContext): Page {
  if (!testContext.page) {
    throw new Error('Page context not initialized. Make sure Before hook ran successfully.');
  }
  return testContext.page;
}

/**
 * Ensures API client is initialized, throws if not
 */
export function ensureApiContext(testContext: ITestContext) {
  if (!testContext.apiClient) {
    throw new Error('API client not initialized. Make sure Before hook ran successfully.');
  }
  return testContext.apiClient;
}

// ============================================================================
// RETRY & RESILIENCE HELPERS
// ============================================================================

/**
 * Clicks element with ad-closing retry on failure
 */
export async function clickWithRetry(
  locator: Locator,
  closeAdsCallback: () => Promise<void>,
  // timeout: number = 5000
): Promise<void> {
  try {
    await locator.click();
    logger.debug('Click successful');
  } catch (error) {
    logger.warn('Click failed, attempting to close ads and retry');
    await closeAdsCallback();
    await locator.click();
  }
}

/**
 * Waits for element visibility with ad-closing retry
 */
export async function waitForVisibleWithRetry(
  locator: Locator,
  closeAdsCallback: () => Promise<void>,
  timeout: number = 30000
): Promise<void> {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    logger.debug('Element visibility confirmed');
  } catch (error) {
    logger.warn('Visibility wait failed, attempting to close ads and retry');
    await closeAdsCallback();
    await locator.waitFor({ state: 'visible', timeout });
  }
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 500
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms`, error);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} retries: ${lastError?.message}`);
}

// ============================================================================
// HTTP STATUS HELPERS
// ============================================================================

/**
 * Validates HTTP status code against expected value(s)
 */
export function validateStatusCode(actualCode: number, expectedCodes: number | number[]): void {
  const codes = Array.isArray(expectedCodes) ? expectedCodes : [expectedCodes];

  if (!codes.includes(actualCode)) {
    const expectedStr = codes.length === 1 ? codes[0] : codes.join(' or ');
    throw new Error(`Expected status code ${expectedStr}, got ${actualCode}`);
  }

  logger.info(`Status code verified: ${actualCode}`);
}

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

/**
 * Extracts array from API response, handles various response formats
 */
export function extractArrayFromResponse<T>(
  response: IAPIResponse<any>,
  arrayKey?: string
): T[] {
  if (!response?.data) {
    throw new Error('Response does not contain data');
  }

  const data = response.data as Record<string, unknown>;

  // Try to get array with specified key
  if (arrayKey && Array.isArray(data[arrayKey])) {
    return data[arrayKey] as T[];
  }

  // Try to get array at root level
  if (Array.isArray(response.data)) {
    return response.data as T[];
  }

  // Try common array keys
  const commonKeys = ['data', 'items', 'results', 'records', 'products', 'brands'];
  for (const key of commonKeys) {
    if (Array.isArray(data[key])) {
      return data[key] as T[];
    }
  }

  throw new Error(`Response does not contain array${arrayKey ? ` with key "${arrayKey}"` : ''}`);
}

/**
 * Validates that response contains an array (with optional key)
 */
export function assertResponseHasArray(response: IAPIResponse<any>, arrayKey?: string): void {
  try {
    extractArrayFromResponse(response, arrayKey);
    logger.info(`Array${arrayKey ? ` "${arrayKey}"` : ''} verified in response`);
  } catch (error) {
    throw error;
  }
}

/**
 * Checks if response has error structure
 */
export function hasErrorStructure(response: IAPIResponse<any>): boolean {
  if (!response) return false;

  return !!(
    response.error ||
    response.message ||
    (response.responseCode && response.responseCode >= 400)
  );
}

/**
 * Asserts that response contains error
 */
export function assertResponseHasError(response: IAPIResponse<any>): void {
  if (!hasErrorStructure(response)) {
    throw new Error('Response does not contain error information');
  }

  logger.info('Error in response verified');
}

/**
 * Asserts that response has proper error format
 */
export function assertErrorFormat(response: IAPIResponse<any>): void {
  const hasFormat = !!(response.error || response.message || response.responseCode);

  if (!hasFormat) {
    throw new Error('Response does not have proper error format');
  }

  logger.info('Error format verified');
}

/**
 * Extracts error message from response
 */
export function getErrorMessage(response: IAPIResponse<any>): string {
  return (response.error || response.message || 'Unknown error') as string;
}

/**
 * Gets value from response data with path support (e.g., 'user.name')
 */
export function getResponseValue(response: IAPIResponse<any>, path: string): any {
  const keys = path.split('.');
  let value: any = response.data;

  for (const key of keys) {
    if (value === null || value === undefined) {
      throw new Error(`Cannot access ${path}: ${key} is undefined`);
    }
    value = value[key];
  }

  return value;
}

// ============================================================================
// FORM & INPUT HELPERS
// ============================================================================

/**
 * Fills form fields from a map
 */
export async function fillFormFields(
  basePage: any,
  fieldMap: Record<string, Locator | string>,
  values: Record<string, string>
): Promise<void> {
  for (const [fieldName, locator] of Object.entries(fieldMap)) {
    const value = values[fieldName];

    if (!value) {
      logger.debug(`Skipping empty value for field: ${fieldName}`);
      continue;
    }

    const resolvedLocator = resolveLocator(locator, basePage.page);
    await basePage.fillInput(resolvedLocator, value);
    logger.debug(`Filled field: ${fieldName}`);
  }
}

/**
 * Fills and interacts with form fields in sequence
 */
export async function fillAndInteractSequence(
  basePage: any,
  fields: Array<{
    locator: Locator | string;
    value: string;
    type: 'fill' | 'select' | 'check' | 'type';
  }>
): Promise<void> {
  for (const field of fields) {
    const resolvedLocator = resolveLocator(field.locator, basePage.page);

    switch (field.type) {
      case 'fill':
        await basePage.fillInput(resolvedLocator, field.value);
        break;
      case 'select':
        await basePage.selectOption(resolvedLocator, field.value);
        break;
      case 'check':
        await basePage.checkCheckbox(resolvedLocator);
        break;
      case 'type':
        await basePage.typeText(resolvedLocator, field.value);
        break;
    }

    logger.debug(`${field.type} interaction completed`);
  }
}

// ============================================================================
// TEXT & DATA EXTRACTION HELPERS
// ============================================================================

/**
 * Extracts and cleans text with optional cleanup function
 */
export async function extractAndClean(
  locator: Locator,
  cleanupFn?: (text: string) => string
): Promise<string> {
  const text = (await locator.textContent()) || '';
  return cleanupFn ? cleanupFn(text.trim()) : text.trim();
}

/**
 * Extracts price value from text
 */
export async function extractPrice(
  locator: Locator,
  currencySymbol: string = 'Rs. '
): Promise<string> {
  return extractAndClean(locator, (text) => text.replace(currencySymbol, ''));
}

/**
 * Extracts number from text
 */
export async function extractNumber(locator: Locator): Promise<number> {
  const text = await extractAndClean(locator);
  const match = text.match(/\d+/);
  if (!match) {
    throw new Error(`No number found in text: ${text}`);
  }
  return parseInt(match[0], 10);
}

/**
 * Gets all text contents and cleans each
 */
export async function extractAllAndClean(
  locator: Locator,
  cleanupFn?: (text: string) => string
): Promise<string[]> {
  const texts = await locator.allTextContents();
  return texts.map((text) => (cleanupFn ? cleanupFn(text.trim()) : text.trim()));
}

// ============================================================================
// DIALOG & INTERACTION HELPERS
// ============================================================================

/**
 * Handles JavaScript alert/confirm dialogs
 */
export async function handleJavaScriptDialog(page: Page): Promise<void> {
  page.once('dialog', async (dialog) => {
    logger.info(`Dialog accepted: ${dialog.message()}`);
    await dialog.accept();
  });
}

/**
 * Clicks element and accepts subsequent dialog
 */
export async function clickWithDialogAccept(
  locator: Locator,
  page: Page
): Promise<void> {
  await handleJavaScriptDialog(page);
  await locator.click();
}

// ============================================================================
// NETWORK & AD-BLOCKING HELPERS
// ============================================================================

/**
 * Setup ad-blocking routes for page
 */
export async function setupAdBlockingRoutes(page: Page): Promise<void> {
  const adRoutes = [
    '**/googleads/**',
    '**/doubleclick/**',
    '**/adsbygoogle/**',
    '**/*.ee/**',
    '**/ads.js',
    '**/advertising/**',
    '**/ad-banner/**',
    '**/*pixel*',
    '**/*tracking*'
  ];

  for (const route of adRoutes) {
    await page.route(route, (route) => route.abort());
  }

  logger.info('Ad-blocking routes configured');
}

/**
 * Closes ads on page via multiple methods
 */
export async function closeAdsComprehensive(page: Page): Promise<void> {
  try {
    // Remove ad elements via JavaScript
    await page.evaluate(() => {
      const selectors = [
        '.ee',
        '[class*="ad"]',
        '[id*="ad"]',
        '[class*="banner"]',
        '[class*="popup"]',
        '.adsbygoogle',
        '[role="alertdialog"]',
        '.modal-backdrop',
        '.overlay'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el: any) => {
          el.remove?.();
        });
      });
    });

    logger.info('Ad elements removed via JavaScript');

    // Try clicking close buttons
    const adCloseButtons = [
      '.ee span',
      '[id*="dismiss"]',
      '[class*="close-ad"]',
      '[aria-label*="close"]',
      'button:has-text("Close")',
      '[role="button"][aria-label*="Close"]'
    ];

    for (const selector of adCloseButtons) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await button.click();
          logger.info(`Closed ad using selector: ${selector}`);
          await page.waitForTimeout(300);
          break;
        }
      } catch (error) {
        logger.debug(`Selector ${selector} not found or not clickable`);
      }
    }
  } catch (error) {
    logger.debug('Error closing ads', error);
  }
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigate to URL, close ads, and wait for element
 */
export async function navigateAndWait(
  page: Page,
  url: string,
  waitElement: Locator,
  closeAds: boolean = true
): Promise<void> {
  logger.info(`Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  if (closeAds) {
    await closeAdsComprehensive(page);
  }

  await waitElement.waitFor({ state: 'visible', timeout: 30000 });
  logger.info('Navigation complete and element visible');
}

// ============================================================================
// ASSERTION & VALIDATION HELPERS
// ============================================================================

/**
 * Asserts error message indicates specific failure type
 */
export function assertErrorIndicatesFailure(
  errorMsg: string,
  failureType: 'auth' | 'validation' | 'generic'
): boolean {
  const failurePatterns: Record<string, RegExp> = {
    auth: /invalid|incorrect|unauthorized|authentication|password|email|login/i,
    validation: /required|invalid|format|must|should|cannot/i,
    generic: /error|failed|fail|not found|404|500/i
  };

  const pattern = failurePatterns[failureType];
  const matches = pattern.test(errorMsg);

  if (!matches) {
    throw new Error(
      `Error message does not indicate ${failureType} failure: ${errorMsg}`
    );
  }

  logger.info(`Error confirmed as ${failureType} failure`);
  return matches;
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Executes step with fallback warning on error
 */
export async function executeStepWithFallback(
  executeFunction: () => Promise<void>,
  fallbackWarning: string
): Promise<void> {
  try {
    await executeFunction();
  } catch (error) {
    logger.warn(`${fallbackWarning}: ${error}`);
    // Continue execution instead of throwing
  }
}

/**
 * Wraps step execution with error handling and logging
 */
export async function executeStepSafely(
  executeFunction: () => Promise<void>,
  stepName: string,
  throwOnError: boolean = true
): Promise<void> {
  try {
    await executeFunction();
    logger.info(`Step completed: ${stepName}`);
  } catch (error) {
    logger.error(`Step failed: ${stepName}`, error);
    if (throwOnError) {
      throw error;
    }
  }
}
