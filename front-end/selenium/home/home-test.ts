import { By, WebDriver, until } from 'selenium-webdriver';
import { logToFile } from '../setup';
import { log } from 'console';

// Function to test the home page
export async function homeTest(driver: WebDriver): Promise<void> {
  try {
    // Log that the test is starting
    logToFile('Starting homeTest...');

    await driver.get('http://localhost:4200/home');

    // Check if the home page title is correct
    const title = await driver.getTitle();
    if (title === 'FrontEnd') {
      // Title is correct
      logToFile(`SUCCESS Home page title: ${title}`);
    } else {
      // Title is incorrect
      logToFile(`ERROR Home page title: ${title}`);
      throw new Error('home page title is incorrect');
    }

    // Check if packages div is present
    await driver.wait(until.elementLocated(By.css('app-packages')), 5000);

    // Check if reset div is present
    await driver.wait(until.elementLocated(By.css('app-reset')), 5000);

    // Check if package div is present
    await driver.wait(until.elementLocated(By.css('app-package')), 5000);

    // Check if packageby-name div is present
    await driver.wait(until.elementLocated(By.css('app-packageby-name')), 5000);

    // Check if packageby-regex div is present
    await driver.wait(until.elementLocated(By.css('app-packageby-regex')), 5000);

    // Reset button test complete
    logToFile('SUCCESS homeTest completed.\n');
  } catch (error) {
    // Log any errors that occur during the test
    logToFile(`ERROR during homeTest: ${error}\n`);
  }
}
