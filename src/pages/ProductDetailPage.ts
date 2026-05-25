import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  // Product detail elements (UI-009)
  readonly productName: Locator = this.page.locator('.product-information h2');
  readonly productPrice: Locator = this.page.locator('.product-information span.currency');
  readonly productStock: Locator = this.page.locator('text=/In Stock|Out of Stock/i');
  readonly productDescription: Locator = this.page.locator('.product-information p');

  // Add to cart on detail page
  readonly addToCartButton: Locator = this.page.locator('button[data-product-id], a.btn:has-text("Add to cart")');

  // Quantity selector (UI-014)
  readonly quantityInput: Locator = this.page.locator('input[name="quantity"]');

  // Review section
  readonly reviewsSection: Locator = this.page.locator('text=/Write Your Review/i');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Get product name (UI-009)
   */
  async getProductName(): Promise<string> {
    return await this.getText(this.productName);
  }

  /**
   * Get product price (UI-009)
   */
  async getProductPrice(): Promise<string> {
    const priceText = await this.getText(this.productPrice);
    return priceText.replace('Rs. ', '').trim();
  }

  /**
   * Verify product details are displayed (UI-009)
   */
  async verifyProductDetailsDisplayed(): Promise<boolean> {
    const nameVisible = await this.isVisible(this.productName);
    const priceVisible = await this.isVisible(this.productPrice);
    const descriptionVisible = await this.isVisible(this.productDescription);
    return nameVisible && priceVisible && descriptionVisible;
  }

  /**
   * Get product description
   */
  async getProductDescription(): Promise<string> {
    return await this.getText(this.productDescription);
  }

  /**
   * Verify stock status (UI-009)
   */
  async verifyStockStatus(): Promise<boolean> {
    return await this.isVisible(this.productStock);
  }

  /**
   * Get stock status text
   */
  async getStockStatus(): Promise<string> {
    return await this.getText(this.productStock);
  }

  /**
   * Set quantity for product (UI-014)
   */
  async setQuantity(quantity: number): Promise<void> {
    const quantityInput = this.page.locator('input[type="number"]').first();
    await quantityInput.fill(String(quantity));
  }

  /**
   * Add product to cart with quantity
   */
  async addToCart(): Promise<void> {
    await this.clickElement(this.addToCartButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify reviews section is present
   */
  async verifyReviewsSection(): Promise<boolean> {
    return await this.isVisible(this.reviewsSection);
  }
}
