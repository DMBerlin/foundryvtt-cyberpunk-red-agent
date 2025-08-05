/**
 * Test script for phone number debugging and mask functionality
 * Run this in the browser console to test phone number features
 */

class PhoneNumberDebugTest {
  constructor() {
    this.cyberpunkAgent = game.modules.get('cyberpunk-agent').api;
  }

  /**
   * Test the phone number mask functionality
   */
  testPhoneMask() {
    console.log("=== Testing Phone Number Mask ===");

    const testNumbers = [
      '1',
      '11',
      '119',
      '1192',
      '11925',
      '119259',
      '1192595',
      '11925958',
      '119259583',
      '1192595832',
      '11192595832'
    ];

    testNumbers.forEach(number => {
      const masked = this._applyPhoneMask(number);
      console.log(`${number.padEnd(11)} -> ${masked}`);
    });
  }

  /**
   * Apply US phone number mask (same as in the application)
   */
  _applyPhoneMask(rawNumber) {
    if (!rawNumber) return '';

    // Limit to 11 digits (1 + area code + prefix + line number)
    const limited = rawNumber.substring(0, 11);

    if (limited.length <= 3) {
      return `(${limited}`;
    } else if (limited.length <= 6) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3)}`;
    } else if (limited.length <= 10) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6)}`;
    } else {
      // 11 digits - add +1 prefix
      return `+1 (${limited.substring(1, 4)}) ${limited.substring(4, 7)}-${limited.substring(7)}`;
    }
  }

  /**
   * Test phone number normalization
   */
  testNormalization() {
    console.log("=== Testing Phone Number Normalization ===");

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    const testNumbers = [
      '1192595832',
      '192595832',
      '92595832',
      '2595832',
      '595832',
      '95832',
      '5832',
      '832',
      '32',
      '2'
    ];

    testNumbers.forEach(number => {
      const normalized = this.cyberpunkAgent.normalizePhoneNumber(number);
      const formatted = this.cyberpunkAgent.formatPhoneNumberForDisplay(normalized);
      console.log(`${number.padEnd(10)} -> normalized: ${normalized.padEnd(11)} -> formatted: ${formatted}`);
    });
  }

  /**
   * Test phone number search functionality
   */
  testPhoneSearch(searchNumber) {
    console.log(`=== Testing Phone Search for: ${searchNumber} ===`);

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    // Test the debug search method
    this.cyberpunkAgent.debugSearchPhoneNumber(searchNumber);
  }

  /**
   * Show all available phone numbers
   */
  showAllNumbers() {
    console.log("=== Showing All Available Phone Numbers ===");

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    this.cyberpunkAgent.debugAllContactNumbers();
  }

  /**
   * Test the complete phone number workflow
   */
  testCompleteWorkflow() {
    console.log("=== Testing Complete Phone Number Workflow ===");

    if (!this.cyberpunkAgent) {
      console.error("Cyberpunk Agent module not found!");
      return;
    }

    // Get the first available phone number for testing
    const phoneNumbers = Array.from(this.cyberpunkAgent.phoneNumberDictionary.keys());

    if (phoneNumbers.length === 0) {
      console.log("No phone numbers available for testing");
      return;
    }

    const testNumber = phoneNumbers[0];
    console.log(`Testing with phone number: ${testNumber}`);

    // Test normalization
    const normalized = this.cyberpunkAgent.normalizePhoneNumber(testNumber);
    console.log(`Normalized: ${normalized}`);

    // Test formatting
    const formatted = this.cyberpunkAgent.formatPhoneNumberForDisplay(normalized);
    console.log(`Formatted: ${formatted}`);

    // Test device lookup
    const deviceId = this.cyberpunkAgent.getDeviceIdFromPhoneNumber(normalized);
    console.log(`Device ID: ${deviceId}`);

    if (deviceId) {
      const device = this.cyberpunkAgent.devices.get(deviceId);
      console.log(`Device Name: ${device ? device.deviceName : 'Unknown'}`);
    }
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log("=== Running All Phone Number Tests ===");

    this.testPhoneMask();
    console.log("");
    this.testNormalization();
    console.log("");
    this.showAllNumbers();
    console.log("");
    this.testCompleteWorkflow();
  }
}

// Create global instance for easy access
window.phoneNumberDebugTest = new PhoneNumberDebugTest();

// Auto-run basic tests
console.log("Phone Number Debug Test Script Loaded");
window.phoneNumberDebugTest.testPhoneMask();

// Usage instructions
console.log(`
=== Usage Instructions ===
To test phone number functionality, run these commands in the console:

1. Test phone mask: phoneNumberDebugTest.testPhoneMask()
2. Test normalization: phoneNumberDebugTest.testNormalization()
3. Show all numbers: phoneNumberDebugTest.showAllNumbers()
4. Test specific search: phoneNumberDebugTest.testPhoneSearch('11192595832')
5. Test complete workflow: phoneNumberDebugTest.testCompleteWorkflow()
6. Run all tests: phoneNumberDebugTest.runAllTests()

Debug methods available on CyberpunkAgent:
- window.CyberpunkAgent.instance.debugAllContactNumbers()
- window.CyberpunkAgent.instance.debugSearchPhoneNumber('11192595832')
`); 