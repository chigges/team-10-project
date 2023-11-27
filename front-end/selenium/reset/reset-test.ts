import { By, WebDriver, until } from 'selenium-webdriver';
import { logToFile } from '../setup';

// Function to test the Reset button
export async function resetTest(driver: WebDriver): Promise<void> {
  try {
    // Log that the test is starting
    logToFile('Starting resetTest...');

    await driver.get('http://localhost:4200/home');

    // Wait for the reset button to be present (timeout is 5 seconds)
    const resetButton = await driver.wait(until.elementLocated(By.css('.reset-container button')), 5000);

    // Click the reset button
    await resetButton.click();

    // Wait for the output or changes caused by clicking the button
    await driver.wait(until.elementLocated(By.css('.reset-message')), 5000);

    // Check reset button output
    const resetResponse = await driver.findElement(By.css('.reset-message'));
    const isVisible = await resetResponse.isDisplayed();

    if (isVisible) {
      const message = await resetResponse.getText();
      if (message === 'Error reseting application.') {
        // Reset failed
        throw new Error('reset failed');
      } else if (message === 'Application reset successful.') {
        // Reset successful
        logToFile(`SUCCESS Reset button message: ${message}`);
      }
    } else {
      throw new Error('reset message not visible');
    }

    // Reset button test complete
    logToFile('SUCCESS resetTest completed.\n');
  } catch (error) {
    // Log any errors that occur during the test
    logToFile(`ERROR during resetTest: ${error}\n`);
  }
}

