import { Given, Then } from '@cucumber/cucumber';
import { HomePage } from '../pages/HomePage';
import { logger } from '../utils/logger';
import { testContext } from '../hooks/hooks';

Given('User navigates to home page', async function() {
  if (!testContext.page) {
    throw new Error('Page context not initialized');
  }

  const homePage = new HomePage(testContext.page);
  await homePage.navigateToHome();
  logger.info('User navigated to home page');
});

Then('Home page should be loaded with all essential elements', async function() {
  if (!testContext.page) {
    throw new Error('Page context not initialized');
  }

  const homePage = new HomePage(testContext.page);
  const isLoaded = await homePage.verifyHomePageLoaded();

  if (!isLoaded) {
    throw new Error('Home page did not load with all essential elements');
  }

  logger.info('Home page verified to be loaded');
});

Then('Products grid should be visible', async function() {
  if (!testContext.page) {
    throw new Error('Page context not initialized');
  }

  const homePage = new HomePage(testContext.page);
  const isVisible = await homePage.isVisible(homePage.page.locator('[id="slider-carousel"], .features_items'));

  if (!isVisible) {
    throw new Error('Products grid not visible');
  }

  logger.info('Products grid verified to be visible');
});

Then('Slider carousel should be displayed', async function() {
  if (!testContext.page) {
    throw new Error('Page context not initialized');
  }

  const homePage = new HomePage(testContext.page);
  const isVisible = await homePage.isVisible(homePage.page.locator('[id="slider-carousel"]'));

  if (!isVisible) {
    throw new Error('Slider carousel not displayed');
  }

  logger.info('Slider carousel verified');
});

Then('Header navigation should be accessible', async function() {
  if (!testContext.page) {
    throw new Error('Page context not initialized');
  }

  const homePage = new HomePage(testContext.page);
  const isVisible = await homePage.isVisible(homePage.homeLink);

  if (!isVisible) {
    throw new Error('Header navigation not accessible');
  }

  logger.info('Header navigation verified');
});

Then('{string} link should be visible in header', async function(linkName: string) {
  if (!testContext.page) {
    throw new Error('Page context not initialized');
  }

  const homePage = new HomePage(testContext.page);
  const link = homePage.page.getByRole('link', { name: new RegExp(linkName, 'i') });
  const isVisible = await homePage.isVisible(link);

  if (!isVisible) {
    throw new Error(`${linkName} link not visible in header`);
  }

  logger.info(`${linkName} link verified in header`);
});
