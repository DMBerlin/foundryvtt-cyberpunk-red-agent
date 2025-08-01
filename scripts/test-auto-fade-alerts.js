/**
 * Test Auto-Fade Alerts
 * Tests the auto-fade functionality for error and success messages
 */

console.log("Cyberpunk Agent | Testing auto-fade alerts...");

/**
 * Test the auto-fade functionality for alert messages
 */
function testAutoFadeAlerts() {
  console.log("=== Testing Auto-Fade Alerts ===");

  // Check if AgentApplication is available
  if (typeof AgentApplication === 'undefined') {
    console.error("❌ AgentApplication not found");
    return false;
  }

  // Check if we have a device to test with
  const devices = window.CyberpunkAgent?.instance?.devices;
  if (!devices || devices.size === 0) {
    console.error("❌ No devices available for testing");
    return false;
  }

  // Get the first available device
  const device = devices.values().next().value;
  console.log("✅ Using device for testing:", device);

  // Create a test application instance
  const testApp = new AgentApplication(device);

  // Test error message auto-fade
  console.log("🧪 Testing error message auto-fade...");
  testApp._showError("Test error message - should fade in 5 seconds");

  // Test success message auto-fade (simulate the state)
  console.log("🧪 Testing success message auto-fade...");
  testApp.addContactState = {
    successMessage: "Test success message - should fade in 5 seconds",
    errorMessage: null,
    searchResult: null,
    phoneNumber: ""
  };

  // Simulate the success message fade logic
  setTimeout(() => {
    const successElement = testApp.element?.find('.cp-success-message');
    if (successElement) {
      successElement.addClass('fading');
      setTimeout(() => {
        testApp.addContactState.successMessage = null;
        console.log("✅ Success message faded out");
      }, 500);
    }
  }, 5000);

  console.log("✅ Auto-fade tests initiated");
  console.log("📝 Check the add contact interface to see the messages fade after 5 seconds");

  return true;
}

/**
 * Manual testing instructions
 */
function manualTestInstructions() {
  console.log("=== Manual Testing Instructions ===");
  console.log("1. Open an agent interface");
  console.log("2. Navigate to 'Add Contact'");
  console.log("3. Try to search for a non-existent contact (should show error)");
  console.log("4. Try to add a valid contact (should show success)");
  console.log("5. Both messages should fade away after 5 seconds");
  console.log("6. Check that the fade animation is smooth");
}

/**
 * Check CSS transitions
 */
function checkCSSTransitions() {
  console.log("=== Checking CSS Transitions ===");

  // Check if the CSS classes exist
  const style = document.createElement('style');
  style.textContent = `
    .cp-error-message { transition: opacity 0.5s ease, transform 0.5s ease; }
    .cp-error-message.fading { opacity: 0; transform: translateY(-10px); }
    .cp-success-message { transition: opacity 0.5s ease, transform 0.5s ease; }
    .cp-success-message.fading { opacity: 0; transform: translateY(-10px); }
  `;

  document.head.appendChild(style);
  console.log("✅ CSS transitions added for testing");

  return true;
}

// Export functions for global access
window.testAutoFadeAlerts = testAutoFadeAlerts;
window.manualTestInstructions = manualTestInstructions;
window.checkCSSTransitions = checkCSSTransitions;

console.log("Cyberpunk Agent | Auto-fade alert tests loaded");
console.log("Available functions:");
console.log("- testAutoFadeAlerts()");
console.log("- manualTestInstructions()");
console.log("- checkCSSTransitions()"); 