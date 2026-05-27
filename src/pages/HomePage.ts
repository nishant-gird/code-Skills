import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

export class HomePage extends BasePage {
  // Header navigation
  readonly homeLink: Locator = this.page.getByRole('link', { name: /home/i });
  readonly productsLink: Locator = this.page.getByRole('link', { name: /products/i });
  readonly cartLink: Locator = this.page.getByRole('link', { name: /cart/i });
  readonly contactLink: Locator = this.page.getByRole('link', { name: /contact/i });
  readonly logoutLink: Locator = this.page.getByRole('link', { name: /logout/i });
  readonly loginLink: Locator = this.page.getByRole('link', { name: /login/i });
  readonly signupLink: Locator = this.page.getByRole('link', { name: /signup/i });

  // Page elements
  readonly userNameBanner: Locator = this.page.locator('text=/Logged in as/i');
  readonly sliderContainer: Locator = this.page.locator('[id="slider-carousel"]');
  readonly featuredItemsSection: Locator = this.page.locator('text=/Features Items/i');
  readonly subscriptionSection: Locator = this.page.locator('text=/Subscription/i');
  readonly adsClosedButton:Locator = this.page.locator('.ee span');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to home page (UI-001)
   */
  async navigateToHome(): Promise<void> {
    await this.goto(`${config.baseUrl}/`);
    await this.closeAds();
    await this.waitForVisible(this.homeLink);
  }

  /**
   * Verify home page is loaded with all essential elements visible (UI-001)
   */
  async verifyHomePageLoaded(): Promise<boolean> {
    const headerVisible = await this.isVisible(this.homeLink);
    const sliderVisible = await this.isVisible(this.sliderContainer);
    const adsClosedButtonVisible = await this.isVisible(this.adsClosedButton);
    console.log(`adsClosedButton`, adsClosedButtonVisible);
    return headerVisible && sliderVisible;
  }

  /**
   * Navigate to products page via header (UI-002)
   */
  async navigateToProducts(): Promise<void> {
    await this.clickElement(this.productsLink);
    await this.waitForNavigation();
  }

  /**
   * Navigate to login/signup page via header (UI-003)
   */
  async navigateToSignup(): Promise<void> {
    await this.clickElement(this.signupLink);
    await this.waitForNavigation();
  }

  /**
   * Navigate to login via header (UI-005)
   */
  async navigateToLogin(): Promise<void> {
    await this.clickElement(this.loginLink);
    await this.waitForNavigation();
  }

  /**
   * Navigate to contact page via header (UI-015)
   */
  async navigateToContact(): Promise<void> {
    await this.clickElement(this.contactLink);
    await this.waitForNavigation();
  }

  /**
   * Navigate to cart via header (UI-014)
   */
  async navigateToCart(): Promise<void> {
    await this.clickElement(this.cartLink);
    await this.waitForNavigation();
  }

  /**
   * Verify user is logged in via profile banner (UI-005)
   */
  async verifyLoggedIn(username?: string): Promise<boolean> {
    const bannerVisible = await this.isVisible(this.userNameBanner);
    if (bannerVisible && username) {
      const bannerText = await this.getText(this.userNameBanner);
      return bannerText.toLowerCase().includes(username.toLowerCase());
    }
    return bannerVisible;
  }

  /**
   * Logout by clicking logout link (UI-007)
   */
  async logout(): Promise<void> {
    await this.clickElement(this.logoutLink);
    await this.waitForNavigation();
  }
}
