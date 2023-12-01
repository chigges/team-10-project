// selenium-test.ts
import { setup } from './setup';
import { homeTest } from './home/home-test';
import { fetchPackagesTest } from './packages/fetch-packages-test';
import { resetTest } from './reset/reset-test';
import { packageByRegexTest } from './packageby-regex/packageby-regex-test';
import { packageByNameTest } from './packageby-name/packageby-name-test';

async function runTests() {
    const driver = await setup();
    try {
        await homeTest(driver); // Home page test
        // await fetchPackagesTest(driver); // Fetch packages test
        await resetTest(driver); // Reset button test
        // await packageByNameTest(driver); // Package by name test
        // await packageByRegexTest(driver); // Package by regex test
       
    } finally {
        await driver.quit();
    }
}

runTests();
