import { Builder, By, until } from 'selenium-webdriver';
const fs = require('fs');

// Specify the path to the log file
const logFilePath = 'selenium-test.log';

// Function to log messages to a file
function logToFile(message: string) {
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

async function reset_button() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // Log that the test is starting
    logToFile('Starting Reset Button Test...');

    // Navigate to the app
    await driver.get('http://localhost:4200/home');
    logToFile('Navigated to http://localhost:4200/home');

    // Wait for the login form to be present (increase timeout to 10 seconds)
    const resetButton = await driver.wait(until.elementLocated(By.css('#button')), 10000);

    // Click the login button
    await resetButton.click();

    // Wait for a moment to see the result
    await driver.sleep(3000);
    logToFile('Test completed successfully.');
  } catch (error) {
    // Log any errors that occur during the test
    logToFile(`Error during Selenium test: ${error}`);
  } finally {
    logToFile('Quitting Selenium test...');
    await driver.quit();
  }
}

reset_button();
