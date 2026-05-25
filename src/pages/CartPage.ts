import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Cart elements (UI-013, UI-014)
  readonly cartTable: Locator = this.page.locator('.cart_info, table');
  readonly cartItems: Locator = this.page.locator('tbody tr, .cart-item');
  readonly emptyCartMessage: Locator = this.page.locator('text=/Your cart is empty/i, text=/No products in cart/i');

  // Item elements
  readonly productNameCell: Locator = this.page.locator('td:nth-child(2)');
  readonly priceCell: Locator = this.page.locator('td:nth-child(3)');
  readonly quantityInput: Locator = this.page.locator('input[class*="quantity"]');
  readonly totalPriceCell: Locator = this.page.locator('td:nth-child(5)');

  // Action buttons
  readonly removeFromCartButton: Locator = this.page.locator('a[data-product-id], a.cart_quantity_delete');
  readonly proceedToCheckoutButton: Locator = this.page.locator('a[href*="checkout"], button:has-text("Proceed To Checkout")');
  readonly continueShoppingButton: Locator = this.page.locator('a:has-text("Continue Shopping")');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify cart is visible and not empty (UI-013)
   */
  async verifyCartNotEmpty(): Promise<boolean> {
    const cartVisible = await this.isVisible(this.cartTable);
    if (!cartVisible) {
      return false;
    }
    const emptyVisible = await this.isVisible(this.emptyCartMessage);
    return !emptyVisible;
  }

  /**
   * Verify cart is empty
   */
  async verifyCartEmpty(): Promise<boolean> {
    return await this.isVisible(this.emptyCartMessage);
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    return await this.getElementCount(this.cartItems);
  }

  /**
   * Get all product names in cart
   */
  async getCartProductNames(): Promise<string[]> {
    const productNameLocator = this.page.locator('.cart_info td:nth-child(2) a, tbody tr td:nth-child(2) a');
    return await this.getAllTexts(productNameLocator);
  }

  /**
   * Modify item quantity (UI-014)
   */
  async modifyItemQuantity(productIndex: number, quantity: number): Promise<void> {
    const quantityInputs = this.page.locator('input[class*="quantity"]');
    const input = quantityInputs.nth(productIndex);
    await input.fill(String(quantity));
  }

  /**
   * Get item total price (UI-014)
   */
  async getItemTotalPrice(productIndex: number): Promise<string> {
    const totalCells = this.page.locator('tbody tr td:nth-child(5), .cart_info tbody tr td:nth-child(5)');
    const totalText = await this.getText(totalCells.nth(productIndex));
    return totalText.replace('Rs. ', '').trim();
  }

  /**
   * Get subtotal (UI-014)
   */
  async getSubtotal(): Promise<string> {
    const subtotalLabel = this.page.locator('text=/Subtotal/i');
    const subtotalRow = subtotalLabel.locator('..').or(subtotalLabel.locator('ancestor::tr'));
    const subtotalValue = subtotalRow.locator('text=/Rs\./');
    const text = await this.getText(subtotalValue);
    return text.replace('Rs. ', '').trim();
  }

  /**
   * Remove item from cart
   */
  async removeItemFromCart(productIndex: number): Promise<void> {
    const removeButtons = this.page.locator('a.cart_quantity_delete, a[data-product-id]');
    await this.clickElement(removeButtons.nth(productIndex));
    await this.page.waitForTimeout(500);
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.clickElement(this.proceedToCheckoutButton);
    await this.waitForNavigation();
  }

  /**
   * Continue shopping
   */
  async continueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton);
    await this.waitForNavigation();
  }
}
