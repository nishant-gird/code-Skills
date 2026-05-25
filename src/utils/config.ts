import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('config', '.env.local') });
dotenv.config({ path: path.resolve('config', '.env.example') });

interface IConfig {
  baseUrl: string;
  apiBaseUrl: string;
  headless: boolean;
  slowMo: number;
  timeout: number;
  logLevel: string;
  apiTimeout: number;
}

const getConfig = (): IConfig => {
  return {
    baseUrl: process.env.BASE_URL || 'https://www.automationexercise.com',
    apiBaseUrl: process.env.API_BASE_URL || 'https://www.automationexercise.com/api',
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '0', 10),
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),
    logLevel: process.env.LOG_LEVEL || 'INFO',
    apiTimeout: parseInt(process.env.API_TIMEOUT || '10000', 10)
  };
};

export const config: IConfig = getConfig();
