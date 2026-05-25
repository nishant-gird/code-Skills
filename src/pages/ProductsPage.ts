import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

export class ProductsPage extends BasePage {
  // Product grid elements (UI-008, UI-009, UI-010, UI-011)
  readonly productsGrid: Locator = this.page.locator('.features_items, .category-products');
  readonly productItems: Locator = this.page.locator('.product-image-wrapper, .productinfo');
  readonly productName: Locator = this.page.locator('.productinfo p');
  readonly productPrice: Locator = this.page.locator('.productinfo h2');
  readonly viewProductButton: Locator = this.page.locator('a:has-text("View Product")');

  // Search elements (UI-010, UI-011)
  readonly searchInput: Locator = this.page.locator('input[id="search_product"]');
  readonly searchButton: Locator = this.page.locator('button[id="submit_search"]');
  readonly noProductsMessage: Locator = this.page.locator('text=/No products are found/i');

  // Filter/Brand elements (UI-012)
  readonly brandFilter: Locator = this.page.locator('text=/Brands/i');
  readonly brandLink: Locator = this.page.locator('a.left-indent');
  readonly categoryFilter: Locator = this.page.locator('text=/Category/i');
  readonly categoryLink: Locator = this.page.locator('.category-products a');

  // Add to cart button (UI-013)
  readonly addToCartButton: Locator = this.page.locator('[data-product-id] .add-to-cart, a:has-text("Add to cart")');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to products page
   */
  async navigateToProducts(): Promise<void> {
    await this.goto(`${config.baseUrl}/products`);
    await this.waitForVisible(this.productsGrid);
  }

  /**
   * Verify products grid is visible (UI-008)
   */
  async verifyProductsGridVisible(): Promise<boolean> {
    return await this.isVisible(this.productsGrid);
  }

  /**
   * Get product count on the page
   */
  async getProductCount(): Promise<number> {
    return await this.getElementCount(this.productItems);
  }

  /**
   * Search for product (UI-010)
   */
  async searchProduct(searchTerm: string): Promise<void> {
    await this.fillInput(this.searchInput, searchTerm);
    await this.clickElement(this.searchButton);
    await this.waitForNavigation();
  }

  /**
   * Verify search returned results (UI-010)
   */
  async verifySearchResults(): Promise<boolean> {
    const noProducts = await this.isVisible(this.noProductsMessage);
    if (noProducts) {
      return false;
    }
    const count = await this.getProductCount();
    return count > 0;
  }

  /**
   * Verify no search results found (UI-011)
   */
  async verifyNoSearchResults(): Promise<boolean> {
    return await this.isVisible(this.noProductsMessage);
  }

  /**
   * Click on specific product to view details (UI-009)
   */
  async clickProductByName(productName: string): Promise<void> {
    const productLink = this.page.locator(`.productinfo:has-text("${productName}") a, p:has-text("${productName}")`);
    await this.clickElement(productLink);
    await this.waitForNavigation();
  }

  /**
   * Click first product to view details
   */
  async clickFirstProduct(): Promise<void> {
    const firstProductLink = this.page.locator('.product-image-wrapper').first().locator('a').first();
    await this.clickElement(firstProductLink);
    await this.waitForNavigation();
  }

  /**
   * Apply brand filter (UI-012)
   */
  async filterByBrand(brandName: string): Promise<void> {
    const brand = this.page.locator(`.left-indent:has-text("${brandName}")`);
    await this.clickElement(brand);
    await this.waitForNavigation();
  }

  /**
   * Apply category filter (UI-012)
   */
  async filterByCategory(categoryName: string): Promise<void> {
    const category = this.page.locator(`.categoryblock a:has-text("${categoryName}")`);
    await this.clickElement(category);
    await this.waitForNavigation();
  }

  /**
   * Verify filter was applied (UI-012)
   */
  async verifyFilterApplied(filterName: string): Promise<boolean> {
    const filterText = this.page.locator(`text=/related to|Category: ${filterName}|${filterName}/i`);
    return await this.isVisible(filterText);
  }

  /**
   * Get product names visible on page
   */
  async getVisibleProductNames(): Promise<string[]> {
    return await this.getAllTexts(this.productName);
  }

  /**
   * Add product to cart by name (UI-013)
   */
  async addProductToCart(productName: string): Promise<void> {
    const product = this.page.locator(`.productinfo:has-text("${productName}")`).first();
    const addButton = product.locator('a:has-text("Add to cart")');
    await this.clickElement(addButton);
    // Wait for modal or notification
    await this.page.waitForTimeout(500);
  }

  /**
   * Add first visible product to cart (UI-013)
   */
  async addFirstProductToCart(): Promise<void> {
    await this.page.hover('.product-image-wrapper:first-child');
    const addButton = this.page.locator('.product-image-wrapper').first().locator('a:has-text("Add to cart")');
    await this.clickElement(addButton);
    await this.page.waitForTimeout(500);
  }
}
