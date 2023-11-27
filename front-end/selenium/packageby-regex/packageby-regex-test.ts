import { By, WebDriver, until } from 'selenium-webdriver';
import { logToFile } from '../setup';

// Function to test fetching a package
export async function packageByRegexTest(driver: WebDriver): Promise<void> {
    try {
      // Log that the test is starting
      logToFile('Starting packageByRegexTest...');
  
      await driver.get('http://localhost:4200/home');
  
      // Locate the input fields and enter package name and version
      const packageRegexInput = await driver.findElement(By.id('regexInput'));
      await packageRegexInput.sendKeys('*'); // Fetch all packages
  
      // Locate and click the "Search Packages" button
      const searchPackagesButton = await driver.wait(until.elementLocated(By.css('.package-search-container button')), 5000);
      await searchPackagesButton.click();
  
      // Wait for the output or changes caused by clicking the button
      const searchResponse = await driver.wait(until.elementLocated(By.css('.package-list')), 5000);
      const isVisible = await searchResponse.isDisplayed();
      
      // TODO: Update this to check for the correct results
      if (isVisible) {
        const message = await searchResponse.getText();
        logToFile(`SUCCESS Search button message: ${message}`);
      } else {
        throw new Error('packages not visible');
      }
  
      // Wait for a moment to see the result
      await driver.sleep(3000);
  
      // Log that the test is complete
      logToFile('SUCCESS packageByRegexTest completed.\n');
    } catch (error) {
      // Log any errors that occur during the test
      logToFile(`ERROR during packageByRegexTest: ${error}\n`);
    }
  }