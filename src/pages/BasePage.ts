import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';
import { logger } from '../utils/logger';

export abstract class BasePage {
  public page: Page;
  protected timeout: number = 30000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    logger.debug('Waiting for URL', { pattern: urlPattern });
    await this.page.waitForURL(urlPattern, { timeout: this.timeout });
  }

  /**
   * Get locator by role with name
   */
  getByRole(role: string, name?: string): Locator {
    if (name) {
      return this.page.getByRole(role as any, { name });
    }
    return this.page.getByRole(role as any);
  }

  /**
   * Get locator by text
   */
  getByText(text: string | RegExp, exact?: boolean): Locator {
    return this.page.getByText(text, { exact });
  }

  /**
   * Get locator by placeholder
   */
  getByPlaceholder(placeholder: string | RegExp): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /**
   * Get locator by label text
   */
  getByLabel(text: string): Locator {
    return this.page.getByLabel(text);
  }

  /**
   * Fill input field with text
   */
  async fillInput(locator: Locator | string, text: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Filling input', { text });
    await element.fill(text);
  }

  /**
   * Click an element
   */
  async clickElement(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Clicking element');
    await element.click();
  }

  /**
   * Type text character by character (useful for inputs that trigger events)
   */
  async typeText(locator: Locator | string, text: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Typing text', { text });
    await element.type(text);
  }

  /**
   * Get text content of an element
   */
  async getText(locator: Locator | string): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Getting text');
    return await element.textContent() || '';
  }

  /**
   * Get all text contents matching a locator
   */
  async getAllTexts(locator: Locator | string): Promise<string[]> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Getting all texts');
    return await element.allTextContents();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator | string): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isVisible();
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Waiting for element to be visible');
    await element.waitFor({ state: 'visible', timeout: this.timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Waiting for element to be hidden');
    await element.waitFor({ state: 'hidden', timeout: this.timeout });
  }

  /**
   * Assert element is visible
   */
  async assertVisible(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Asserting element is visible');
    await expect(element).toBeVisible();
  }

  /**
   * Assert element contains text
   */
  async assertContainsText(locator: Locator | string, text: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Asserting element contains text', { text });
    await expect(element).toContainText(text);
  }

  /**
   * Assert element has exact text
   */
  async assertHasText(locator: Locator | string, text: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Asserting element has exact text', { text });
    await expect(element).toHaveText(text);
  }

  /**
   * Wait for navigation (new page load)
   */
  async waitForNavigation(): Promise<void> {
    logger.debug('Waiting for navigation');
    await this.page.waitForLoadState('networkidle', { timeout: this.timeout });
  }

  /**
   * Get input value
   */
  async getInputValue(locator: Locator | string): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.inputValue();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator | string, value: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Selecting option', { value });
    await element.selectOption(value);
  }

  /**
   * Get attribute value
   */
  async getAttribute(locator: Locator | string, attribute: string): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.getAttribute(attribute);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Checking checkbox');
    await element.check();
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Unchecking checkbox');
    await element.uncheck();
  }

  /**
   * Upload file
   */
  async uploadFile(locator: Locator | string, filePath: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug('Uploading file', { filePath });
    await element.setInputFiles(filePath);
  }

  /**
   * Take screenshot
   */
  async screenshot(filename: string): Promise<void> {
    logger.info('Taking screenshot', { filename });
    await this.page.screenshot({ path: `allure-results/${filename}` });
  }

  /**
   * Wait for timeout (use sparingly - should use assertions instead)
   */
  async sleep(milliseconds: number): Promise<void> {
    logger.warn(`Using sleep - should prefer assertions: ${milliseconds}ms`);
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Get count of elements matching locator
   */
  async getElementCount(locator: Locator | string): Promise<number> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.count();
  }
}
