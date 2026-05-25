import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';
import { config } from '../utils/config';
import { IUserData } from '../utils/types';

export class AuthPage extends BasePage {
  // Login form elements (UI-005, UI-006)
  readonly loginEmailInput: Locator = this.page.locator('input[data-qa="login-email"]');
  readonly loginPasswordInput: Locator = this.page.locator('input[data-qa="login-password"]');
  readonly loginButton: Locator = this.page.locator('button[data-qa="login-button"]');
  readonly loginErrorMessage: Locator = this.page.locator('text=/Your email or password is incorrect/i');

  // Signup form elements (UI-004)
  readonly signupNameInput: Locator = this.page.locator('input[data-qa="signup-name"]');
  readonly signupEmailInput: Locator = this.page.locator('input[data-qa="signup-email"]');
  readonly signupButton: Locator = this.page.locator('button[data-qa="signup-button"]');

  // Registration form (after signup)
  readonly titleMrRadio: Locator = this.page.locator('input[value="Mr"]');
  readonly titleMrsRadio: Locator = this.page.locator('input[value="Mrs"]');
  readonly passwordInput: Locator = this.page.locator('input[data-qa="password"]');
  readonly daySelect: Locator = this.page.locator('select[data-qa="days"]');
  readonly monthSelect: Locator = this.page.locator('select[data-qa="months"]');
  readonly yearSelect: Locator = this.page.locator('select[data-qa="years"]');
  readonly firstNameInput: Locator = this.page.locator('input[data-qa="first_name"]');
  readonly lastNameInput: Locator = this.page.locator('input[data-qa="last_name"]');
  readonly addressInput: Locator = this.page.locator('input[data-qa="address"]');
  readonly countrySelect: Locator = this.page.locator('select[data-qa="country"]');
  readonly stateInput: Locator = this.page.locator('input[data-qa="state"]');
  readonly cityInput: Locator = this.page.locator('input[data-qa="city"]');
  readonly zipcodeInput: Locator = this.page.locator('input[data-qa="zipcode"]');
  readonly mobileInput: Locator = this.page.locator('input[data-qa="mobile_number"]');
  readonly createAccountButton: Locator = this.page.locator('button[data-qa="create-account"]');

  readonly accountCreatedMessage: Locator = this.page.locator('text=/Account Created!/i');
  readonly continueButton: Locator = this.page.locator('button[data-qa="continue-button"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to auth page
   */
  async navigateToAuth(): Promise<void> {
    await this.goto(`${config.baseUrl}/login`);
    await this.waitForVisible(this.loginEmailInput);
  }

  /**
   * Login with email and password (UI-005)
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillInput(this.loginEmailInput, email);
    await this.fillInput(this.loginPasswordInput, password);
    await this.clickElement(this.loginButton);
    await this.waitForNavigation();
  }

  /**
   * Attempt invalid login and verify error message (UI-006)
   */
  async attemptLoginWithInvalidCredentials(email: string, password: string): Promise<void> {
    await this.fillInput(this.loginEmailInput, email);
    await this.fillInput(this.loginPasswordInput, password);
    await this.clickElement(this.loginButton);
    await this.waitForVisible(this.loginErrorMessage);
  }

  /**
   * Verify login error message is displayed (UI-006)
   */
  async verifyLoginErrorMessage(): Promise<boolean> {
    return await this.isVisible(this.loginErrorMessage);
  }

  /**
   * Start signup process (UI-004)
   */
  async startSignup(name: string, email: string): Promise<void> {
    await this.fillInput(this.signupNameInput, name);
    await this.fillInput(this.signupEmailInput, email);
    await this.clickElement(this.signupButton);
    await this.waitForVisible(this.titleMrRadio);
  }

  /**
   * Complete registration form (UI-004)
   */
  async completeRegistration(userData: IUserData): Promise<void> {
    // Select title
    await this.clickElement(this.titleMrRadio);

    // Fill password
    await this.fillInput(this.passwordInput, userData.password);

    // Fill date of birth
    await this.selectOption(this.daySelect, '15');
    await this.selectOption(this.monthSelect, 'January');
    await this.selectOption(this.yearSelect, '1990');

    // Fill personal info
    await this.fillInput(this.firstNameInput, userData.firstName);
    await this.fillInput(this.lastNameInput, userData.lastName);
    await this.fillInput(this.addressInput, userData.address);

    // Fill location
    await this.selectOption(this.countrySelect, userData.country);
    await this.fillInput(this.stateInput, userData.state);
    await this.fillInput(this.cityInput, userData.city);
    await this.fillInput(this.zipcodeInput, userData.zipCode);
    await this.fillInput(this.mobileInput, userData.mobileNumber);

    // Create account
    await this.clickElement(this.createAccountButton);
    await this.waitForVisible(this.accountCreatedMessage);
  }

  /**
   * Verify account created successfully (UI-004)
   */
  async verifyAccountCreated(): Promise<boolean> {
    return await this.isVisible(this.accountCreatedMessage);
  }

  /**
   * Continue after account creation
   */
  async continueAfterAccountCreation(): Promise<void> {
    await this.clickElement(this.continueButton);
    await this.waitForNavigation();
  }
}
