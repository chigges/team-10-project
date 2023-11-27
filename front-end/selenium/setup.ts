import { Builder, WebDriver } from 'selenium-webdriver';
import { baseUrl, fs, logFilePath } from './config';

// Function to log messages to a file
export function logToFile(message: string) {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

// Setup driver to use Chrome
export async function setup(): Promise<WebDriver> {
  logToFile(`Starting setup()...`);
  const driver = await new Builder().forBrowser('chrome').build();
  await driver.get(baseUrl);
  logToFile(`SUCCESS setup() complete. Navigated to ${baseUrl}\n`);
  return driver;
}

