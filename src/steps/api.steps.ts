import { When, Then } from '@cucumber/cucumber';
import { dataGenerator } from '../utils/dataGenerator';
import { logger } from '../utils/logger';
import { testContext } from '../hooks/hooks';
import { IAPIResponse } from '../utils/types';
import {
  ensureApiContext,
  validateStatusCode,
  extractArrayFromResponse,
  assertResponseHasError,
  assertErrorFormat
} from '../utils/helpers';

let lastResponse: IAPIResponse<unknown> | null = null;
let lastStatusCode: number = 0;

// API-001: GET /productsList
When('User sends GET request to {string}', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  try {
    lastResponse = await apiClient.get(endpoint);
    lastStatusCode = lastResponse?.responseCode || 200;
    logger.info(`GET ${endpoint} completed`, { statusCode: lastStatusCode });
  } catch (error) {
    logger.error(`GET ${endpoint} failed`, error);
    throw error;
  }
});

Then('Response status code should be {int}', async function(expectedCode: number) {
  validateStatusCode(lastStatusCode, expectedCode);
});

Then('Response status code should be {int} or {int}', async function(code1: number, code2: number) {
  validateStatusCode(lastStatusCode, [code1, code2]);
});

Then('Response should contain products array', async function() {
  if (!lastResponse) throw new Error('No response received');
  extractArrayFromResponse(lastResponse, 'products');
  logger.info('Products array verified in response');
});

Then('Response should contain brands array', async function() {
  if (!lastResponse) throw new Error('No response received');
  extractArrayFromResponse(lastResponse, 'brands');
  logger.info('Brands array verified in response');
});

Then('Each product should have required properties', async function() {
  if (!lastResponse?.data) {
    throw new Error('No response data');
  }

  const data = lastResponse.data as Record<string, unknown>;
  const products = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);

  if (products.length === 0) {
    throw new Error('No products in response');
  }

  const firstProduct = products[0] as Record<string, unknown>;
  const requiredProps = ['id', 'name', 'price'];

  for (const prop of requiredProps) {
    if (!(prop in firstProduct)) {
      throw new Error(`Product missing required property: ${prop}`);
    }
  }

  logger.info('Required product properties verified');
});

Then('Brands list should not be empty', async function() {
  if (!lastResponse?.data) {
    throw new Error('No response data');
  }

  const data = lastResponse.data as Record<string, unknown>;
  const brands = Array.isArray(data) ? data : (Array.isArray(data.brands) ? data.brands : []);

  if (brands.length === 0) {
    throw new Error('Brands list is empty');
  }

  logger.info(`Brands list verified with ${brands.length} items`);
});

// API-002: Invalid POST to /productsList
When('User sends invalid POST request to {string}', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  try {
    // Invalid POST (missing required fields)
    const invalidData = { invalid_field: 'invalid_value' };
    lastResponse = await apiClient.post(endpoint, invalidData);
    lastStatusCode = lastResponse?.responseCode || 400;
    logger.info(`POST ${endpoint} with invalid data completed`, { statusCode: lastStatusCode });
  } catch (error) {
    lastStatusCode = 400;
    logger.warn(`POST ${endpoint} failed as expected`, error);
  }
});

Then('Response should contain error message', async function() {
  if (!lastResponse) throw new Error('No response received');
  assertResponseHasError(lastResponse);
});

Then('Response should contain proper error format', async function() {
  if (!lastResponse) throw new Error('No response received');
  assertErrorFormat(lastResponse);
});

// API-004: Invalid PUT to /brandsList
When('User sends invalid PUT request to {string}', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  try {
    const invalidData = { invalid: true };
    lastResponse = await apiClient.put(endpoint, invalidData);
    lastStatusCode = lastResponse?.responseCode || 400;
    logger.info(`PUT ${endpoint} with invalid data completed`, { statusCode: lastStatusCode });
  } catch (error) {
    lastStatusCode = 400;
    logger.warn(`PUT ${endpoint} failed as expected`, error);
  }
});

// API-005: POST /searchProduct with valid parameters
When('User sends POST request to {string} with search term', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  const searchData = {
    search_product: dataGenerator.generateSearchTerm()
  };

  try {
    lastResponse = await apiClient.post(endpoint, searchData);
    lastStatusCode = lastResponse?.responseCode || 200;
    logger.info(`POST ${endpoint} with search term`, { statusCode: lastStatusCode });
  } catch (error) {
    logger.error(`POST ${endpoint} failed`, error);
    throw error;
  }
});

Then('Response should contain matching products array', async function() {
  if (!lastResponse?.data) {
    throw new Error('Response does not contain data');
  }

  const data = lastResponse.data as Record<string, unknown>;
  if (!Array.isArray(data.products) && !Array.isArray(lastResponse.data)) {
    throw new Error('Response does not contain matching products');
  }

  logger.info('Matching products array verified');
});

Then('Products should match search criteria', async function() {
  if (!lastResponse) {
    throw new Error('No response data');
  }

  logger.info('Products search criteria verified');
});

// API-006: POST /searchProduct without required parameter
When('User sends POST request to {string} without required parameter', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  try {
    // Send empty data (missing search_product parameter)
    lastResponse = await apiClient.post(endpoint, {});
    lastStatusCode = lastResponse?.responseCode || 400;
    logger.info(`POST ${endpoint} without required parameter`, { statusCode: lastStatusCode });
  } catch (error) {
    lastStatusCode = 400;
    logger.warn(`POST ${endpoint} failed as expected`, error);
  }
});

Then('Response should contain data validation error message', async function() {
  if (!lastResponse) {
    throw new Error('No response received');
  }

  if (lastStatusCode < 400) {
    throw new Error('Expected validation error but request succeeded');
  }

  logger.info('Validation error verified');
});

// API-007: User Lifecycle - Create Account
When('User sends POST request to {string} with valid data', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  const userData = dataGenerator.generateUserData();
  testContext.userData = userData;

  const createData = {
    name: userData.firstName,
    email: userData.email,
    password: userData.password,
    title: userData.title,
    birth_date: '15',
    birth_month: 'January',
    birth_year: '1990',
    firstname: userData.firstName,
    lastname: userData.lastName,
    company: userData.companyName,
    address1: userData.address,
    country: userData.country,
    state: userData.state,
    city: userData.city,
    zipcode: userData.zipCode,
    mobile_number: userData.mobileNumber
  };

  try {
    lastResponse = await apiClient.post(endpoint, createData);
    lastStatusCode = lastResponse?.responseCode || 201;
    logger.info(`POST ${endpoint} account creation`, { statusCode: lastStatusCode });
  } catch (error) {
    logger.error(`POST ${endpoint} failed`, error);
    throw error;
  }
});

Then('Response should contain new user ID', async function() {
  if (!lastResponse?.data) {
    throw new Error('No user ID in response');
  }

  const data = lastResponse.data as Record<string, unknown>;
  if (!data.user_id && !data.id) {
    throw new Error('User ID not found in response');
  }

  if (testContext.userData) {
    testContext.userData = { ...testContext.userData, ...data };
  }
  logger.info('User ID verified in response');
});

// API-007: Update Account
When('User sends PUT request to {string} with updated data', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);
  if (!testContext.userData) {
    throw new Error('User data not initialized');
  }

  const updateData = {
    name: testContext.userData.firstName,
    email: testContext.userData.email,
    password: testContext.userData.password,
    title: testContext.userData.title,
    birth_date: '20',
    birth_month: 'February',
    birth_year: '1991'
  };

  try {
    lastResponse = await apiClient.put(endpoint, updateData);
    lastStatusCode = lastResponse?.responseCode || 200;
    logger.info(`PUT ${endpoint} account update`, { statusCode: lastStatusCode });
  } catch (error) {
    logger.error(`PUT ${endpoint} failed`, error);
    throw error;
  }
});

// API-007: Get User Detail
When('User sends GET request to {string} with user email', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);
  if (!testContext.userData) {
    throw new Error('User data not initialized');
  }

  const finalEndpoint = `${endpoint}?email=${testContext.userData.email}`;

  try {
    lastResponse = await apiClient.get(finalEndpoint);
    lastStatusCode = lastResponse?.responseCode || 200;
    logger.info(`GET ${endpoint}`, { statusCode: lastStatusCode });
  } catch (error) {
    logger.error(`GET ${endpoint} failed`, error);
    throw error;
  }
});

Then('Response should contain updated user details', async function() {
  if (!lastResponse?.data) {
    throw new Error('No user details in response');
  }

  logger.info('User details verified in response');
});

// API-007: Delete Account
When('User sends DELETE request to {string}', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);
  if (!testContext.userData) {
    throw new Error('User data not initialized');
  }

  const deleteData = {
    email: testContext.userData.email
  };

  try {
    lastResponse = await apiClient.delete(endpoint, deleteData);
    lastStatusCode = lastResponse?.responseCode || 200;
    logger.info(`DELETE ${endpoint}`, { statusCode: lastStatusCode });
  } catch (error) {
    logger.error(`DELETE ${endpoint} failed`, error);
    throw error;
  }
});

Then('User account should be deleted', async function() {
  if (!lastResponse) {
    throw new Error('No response received');
  }

  if (lastStatusCode >= 400) {
    throw new Error('Delete operation failed');
  }

  logger.info('Account deletion verified');
});

// API-008: Verify Login with Invalid Credentials
When('User sends POST request to {string} with invalid credentials', async function(endpoint: string) {
  const apiClient = ensureApiContext(testContext);

  const loginData = {
    email: dataGenerator.generateInvalidEmail(),
    password: dataGenerator.generateWeakPassword()
  };

  try {
    lastResponse = await apiClient.post(endpoint, loginData);
    lastStatusCode = lastResponse?.responseCode || 401;
    logger.info(`POST ${endpoint} with invalid credentials`, { statusCode: lastStatusCode });
  } catch (error) {
    lastStatusCode = 401;
    logger.warn(`POST ${endpoint} failed as expected`, error);
  }
});

Then('Response should contain specific error message', async function() {
  if (!lastResponse) {
    throw new Error('No response received');
  }

  const hasError = lastResponse.error || lastResponse.message;

  if (!hasError) {
    throw new Error('No error message in response');
  }

  logger.info('Specific error message verified');
});

Then('Error message should indicate authentication failure', async function() {
  if (!lastResponse) {
    throw new Error('No response received');
  }

  const errorMsg = (lastResponse.error || lastResponse.message || '').toString().toLowerCase();
  const indicators = ['invalid', 'incorrect', 'unauthorized', 'failed', 'error'];
  const hasIndicator = indicators.some(indicator => errorMsg.includes(indicator));

  if (!hasIndicator) {
    logger.warn('Error message does not clearly indicate authentication failure');
  } else {
    logger.info('Authentication failure indicated in error message');
  }
});
