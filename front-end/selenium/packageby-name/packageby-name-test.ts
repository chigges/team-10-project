import { By, WebDriver, until,  } from 'selenium-webdriver';
import { logToFile } from '../setup';

// Function to test fetching a package
export async function packageByNameTest(driver: WebDriver): Promise<void> {
    try {
      // Log that the test is starting
      logToFile('Starting packageByNameTest...');
  
      await driver.get('http://localhost:4200/home');
  
      // Locate the input fields and enter package name and version
      const packageNameInput = await driver.findElement(By.css('.package-by-name-container input'));
      await packageNameInput.sendKeys('*'); // Fetch all packages
  
      // Locate and click the history button
      const historyButton = await driver.findElement(By.id('historyButton'));
      await historyButton.click();
  
      // Wait for the output or changes caused by clicking the button
      const historyResponse = await driver.wait(until.elementLocated(By.css('.history-entry')), 5000);
      const isVisible = await historyResponse.isDisplayed();
      
      // TODO: Update this to check for the correct results
      if (isVisible) {
        const message = await historyResponse.getText();
        logToFile(`SUCCESS Package history button message: ${message}`);
      } else {
        throw new Error('packages not visible');
      }

      // Locate and click the delete button
      const deleteButton = await driver.findElement(By.id('deleteByNameButton'));
      await deleteButton.click();
  
      // Wait for the output or changes caused by clicking the button
      const deleteResponse = await driver.wait(until.elementLocated(By.css('.message')), 5000);
      const isVisibleDelete = await deleteResponse.isDisplayed();
      
      // TODO: Update this to check for the correct results
      if (isVisibleDelete) {
        const deleteMessage = await deleteResponse.getText();
        if (deleteMessage === 'Package deletion unsuccessful') {
            throw new Error('deletion failed');
        } else {
            logToFile(`SUCCESS Package deletion button message: ${deleteMessage}`);
        }
      } else {
        throw new Error('no response');
      }
  
      // Wait for a moment to see the result
      await driver.sleep(3000);
  
      // Log that the test is complete
      logToFile('SUCCESS packageByNameTest completed.\n');
    } catch (error) {
      // Log any errors that occur during the test
      logToFile(`ERROR during packageByNameTest: ${error}\n`);
    }
  }
