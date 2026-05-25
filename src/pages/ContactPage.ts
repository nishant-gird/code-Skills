import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

export class ContactPage extends BasePage {
  // Contact form elements (UI-015)
  readonly nameInput: Locator = this.page.locator('input[data-qa="name"], input[name="name"]');
  readonly emailInput: Locator = this.page.locator('input[data-qa="email"], input[name="email"]');
  readonly subjectInput: Locator = this.page.locator('input[data-qa="subject"], input[name="subject"]');
  readonly messageInput: Locator = this.page.locator('textarea[data-qa="message"], textarea[name="message"]');
  readonly fileUploadInput: Locator = this.page.locator('input[type="file"], input[name="upload_file"]');
  readonly submitButton: Locator = this.page.locator('button[data-qa="submit"], input[type="submit"]');

  // Confirmation elements
  readonly successMessage: Locator = this.page.locator('text=/Thank you|success|sent|submitted/i');
  readonly homeButton: Locator = this.page.locator('button[data-qa="contact-us-button"], a:has-text("Back to home")');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to contact page
   */
  async navigateToContact(): Promise<void> {
    await this.goto(`${config.baseUrl}/contact_us`);
    await this.waitForVisible(this.nameInput);
  }

  /**
   * Fill contact form (UI-015)
   */
  async fillContactForm(name: string, email: string, subject: string, message: string): Promise<void> {
    await this.fillInput(this.nameInput, name);
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.subjectInput, subject);
    await this.fillInput(this.messageInput, message);
  }

  /**
   * Upload file attachment (UI-015)
   */
  async uploadAttachment(filePath: string): Promise<void> {
    await this.uploadFile(this.fileUploadInput, filePath);
  }

  /**
   * Submit contact form (UI-015)
   */
  async submitContactForm(): Promise<void> {
    // Handle JavaScript alert
    this.page.once('dialog', dialog => dialog.accept());
    await this.clickElement(this.submitButton);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify form submission success (UI-015)
   */
  async verifyFormSubmissionSuccess(): Promise<boolean> {
    return await this.isVisible(this.successMessage);
  }

  /**
   * Click home button after submission
   */
  async clickHomeButton(): Promise<void> {
    await this.clickElement(this.homeButton);
    await this.waitForNavigation();
  }
}
