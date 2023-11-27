import { By, WebDriver, until } from 'selenium-webdriver';
import { logToFile } from '../setup';

// Function to test fetching a package
export async function fetchPackagesTest(driver: WebDriver): Promise<void> {
    try {
      // Log that the test is starting
      logToFile('Starting fetchPackageTest...');
  
      await driver.get('http://localhost:4200/home');
  
      // Locate the input fields and enter package name and version
      const packageNameInput = await driver.findElement(By.id('packageName'));
      await packageNameInput.sendKeys('*'); // Fetch all packages
  
      const packageVersionInput = await driver.findElement(By.id('packageVersion'));
      await packageVersionInput.sendKeys(''); // Leave blank to fetch all versions
  
      // Locate and click the "Fetch Packages" button
      const fetchPackagesButton = await driver.wait(until.elementLocated(By.id('fetchButton')), 5000);
      await fetchPackagesButton.click();
  
      // Wait for the output or changes caused by clicking the button
      await driver.wait(until.elementLocated(By.css('.package-list-container')), 5000);
  
      // Check fetch button output
      const fetchResponse = await driver.findElement(By.css('.reset-message'));
      const isVisible = await fetchResponse.isDisplayed();
      
      // TODO: Update this to check for the correct results
      if (isVisible) {
        const message = await fetchResponse.getText();
        logToFile(`SUCCESS Fetch button message: ${message}`);
      } else {
        throw new Error('packages not visible');
      }
  
      // Wait for a moment to see the result
      await driver.sleep(3000);
  
      // Log that the test is complete
      logToFile('SUCCESS fetchPackageTest completed.\n');
    } catch (error) {
      // Log any errors that occur during the test
      logToFile(`ERROR during fetchPackageTest: ${error}\n`);
    }
  }