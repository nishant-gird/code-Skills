import { APIRequestContext, Page } from 'playwright';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { IAPIResponse } from '../utils/types';
import * as querystring from 'querystring';

interface IRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export class APIClient {
  private apiContext: APIRequestContext | null = null;
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || config.apiBaseUrl;
    this.timeout = timeout || config.apiTimeout;
  }

  /**
   * Initialize API context from Playwright page
   */
  async initialize(page: Page): Promise<void> {
    const context = page.context();
    this.apiContext = await context.request;
    logger.info('API Client initialized', { baseUrl: this.baseUrl });
  }

  /**
   * Ensure API context is available
   */
  private ensureContext(): APIRequestContext {
    if (!this.apiContext) {
      throw new Error('API context not initialized. Call initialize() first.');
    }
    return this.apiContext;
  }

  /**
   * Convert form data object to URL-encoded string
   */
  private encodeFormData(data: Record<string, unknown>): string {
    const encoded: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        encoded[key] = String(value);
      }
    }
    return querystring.stringify(encoded);
  }

  /**
   * Build complete URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: IRequestOptions): Promise<IAPIResponse<T>> {
    const context = this.ensureContext();
    const url = this.buildUrl(endpoint);

    try {
      logger.debug('GET request', { url });
      const response = await context.get(url, {
        headers: this.getDefaultHeaders(options?.headers),
        timeout: options?.timeout || this.timeout
      });

      const data = await response.json() as IAPIResponse<T>;
      logger.info('GET success', { url, status: response.status() });
      return data;
    } catch (error) {
      logger.error('GET failed', { url, error: String(error) });
      throw error;
    }
  }

  /**
   * POST request with form-data encoding
   */
  async post<T>(endpoint: string, data: Record<string, unknown>, options?: IRequestOptions): Promise<IAPIResponse<T>> {
    const context = this.ensureContext();
    const url = this.buildUrl(endpoint);
    const encodedData = this.encodeFormData(data);

    try {
      logger.debug('POST request', { url, data });
      const response = await context.post(url, {
        data: encodedData,
        headers: {
          ...this.getDefaultHeaders(options?.headers),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: options?.timeout || this.timeout
      });

      const responseData = await response.json() as IAPIResponse<T>;
      logger.info('POST success', { url, status: response.status() });
      return responseData;
    } catch (error) {
      logger.error('POST failed', { url, error: String(error) });
      throw error;
    }
  }

  /**
   * PUT request with form-data encoding
   */
  async put<T>(endpoint: string, data: Record<string, unknown>, options?: IRequestOptions): Promise<IAPIResponse<T>> {
    const context = this.ensureContext();
    const url = this.buildUrl(endpoint);
    const encodedData = this.encodeFormData(data);

    try {
      logger.debug('PUT request', { url, data });
      const response = await context.put(url, {
        data: encodedData,
        headers: {
          ...this.getDefaultHeaders(options?.headers),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: options?.timeout || this.timeout
      });

      const responseData = await response.json() as IAPIResponse<T>;
      logger.info('PUT success', { url, status: response.status() });
      return responseData;
    } catch (error) {
      logger.error('PUT failed', { url, error: String(error) });
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, data?: Record<string, unknown>, options?: IRequestOptions): Promise<IAPIResponse<T>> {
    const context = this.ensureContext();
    const url = this.buildUrl(endpoint);

    try {
      logger.debug('DELETE request', { url });
      const requestOptions: Parameters<typeof context.delete>[1] = {
        headers: this.getDefaultHeaders(options?.headers),
        timeout: options?.timeout || this.timeout
      };

      if (data) {
        const encodedData = this.encodeFormData(data);
        requestOptions.data = encodedData;
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      }

      const response = await context.delete(url, requestOptions);
      const responseData = await response.json() as IAPIResponse<T>;
      logger.info('DELETE success', { url, status: response.status() });
      return responseData;
    } catch (error) {
      logger.error('DELETE failed', { url, error: String(error) });
      throw error;
    }
  }

  /**
   * Get default headers
   */
  private getDefaultHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const defaults: Record<string, string> = {
      'User-Agent': 'QA-Automation-Framework/1.0'
    };
    return { ...defaults, ...customHeaders };
  }
}
