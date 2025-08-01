/**
 * Test script for Contact Manager automatic updates
 * Run this in the browser console to test the functionality
 */

console.log("Cyberpunk Agent | Testing Contact Manager automatic updates...");

function testContactManagerUpdates() {
  console.log("=== Contact Manager Update Test ===");

  // Check if the module is loaded
  if (!window.CyberpunkAgent || !window.CyberpunkAgent.instance) {
    console.error("❌ CyberpunkAgent not loaded!");
    return false;
  }

  console.log("✅ CyberpunkAgent loaded");

  // Check if ContactManagerApplication is available
  if (typeof ContactManagerApplication === 'undefined') {
    console.error("❌ ContactManagerApplication not loaded!");
    return false;
  }

  console.log("✅ ContactManagerApplication loaded");

  // Test real-time update system
  console.log("Testing real-time update system...");

  // Check if updateOpenInterfaces method exists
  if (typeof window.CyberpunkAgent.instance.updateOpenInterfaces === 'function') {
    console.log("✅ updateOpenInterfaces method available");
  } else {
    console.error("❌ updateOpenInterfaces method not available");
    return false;
  }

  // Check if hasOpenInterfaces method exists
  if (typeof window.CyberpunkAgent.instance.hasOpenInterfaces === 'function') {
    console.log("✅ hasOpenInterfaces method available");
  } else {
    console.error("❌ hasOpenInterfaces method not available");
    return false;
  }

  // Check if getOpenInterfacesCount method exists
  if (typeof window.CyberpunkAgent.instance.getOpenInterfacesCount === 'function') {
    console.log("✅ getOpenInterfacesCount method available");
  } else {
    console.error("❌ getOpenInterfacesCount method not available");
    return false;
  }

  // Test contact management methods
  console.log("Testing contact management methods...");

  // Check if addContactToActor method exists
  if (typeof window.CyberpunkAgent.instance.addContactToActor === 'function') {
    console.log("✅ addContactToActor method available");
  } else {
    console.error("❌ addContactToActor method not available");
    return false;
  }

  // Check if removeContactFromActor method exists
  if (typeof window.CyberpunkAgent.instance.removeContactFromActor === 'function') {
    console.log("✅ removeContactFromActor method available");
  } else {
    console.error("❌ removeContactFromActor method not available");
    return false;
  }

  // Check if saveContactNetworks method exists
  if (typeof window.CyberpunkAgent.instance.saveContactNetworks === 'function') {
    console.log("✅ saveContactNetworks method available");
  } else {
    console.error("❌ saveContactNetworks method not available");
    return false;
  }

  // Check if notifyContactUpdate method exists
  if (typeof window.CyberpunkAgent.instance.notifyContactUpdate === 'function') {
    console.log("✅ notifyContactUpdate method available");
  } else {
    console.error("❌ notifyContactUpdate method not available");
    return false;
  }

  // Test socket communication
  console.log("Testing socket communication...");

  if (game.socket) {
    console.log("✅ Socket communication available");
  } else {
    console.warn("⚠️ Socket communication not available (using fallback)");
  }

  // Test current open interfaces
  console.log("Testing current open interfaces...");

  const hasOpen = window.CyberpunkAgent.instance.hasOpenInterfaces();
  const count = window.CyberpunkAgent.instance.getOpenInterfacesCount();

  console.log(`📊 Open interfaces: ${count} (has open: ${hasOpen})`);

  // Test real-time update trigger
  console.log("Testing real-time update trigger...");

  try {
    window.CyberpunkAgent.instance.updateOpenInterfaces();
    console.log("✅ Real-time update trigger successful");
  } catch (error) {
    console.error("❌ Real-time update trigger failed:", error);
    return false;
  }

  // Test contact update notification
  console.log("Testing contact update notification...");

  try {
    window.CyberpunkAgent.instance.notifyContactUpdate();
    console.log("✅ Contact update notification successful");
  } catch (error) {
    console.error("❌ Contact update notification failed:", error);
    return false;
  }

  console.log("=== All tests completed successfully! ===");
  return true;
}

function testContactManagerUI() {
  console.log("=== Contact Manager UI Test ===");

  // Check if ContactManagerApplication can be instantiated
  try {
    const contactManager = new ContactManagerApplication();
    console.log("✅ ContactManagerApplication instantiation successful");

    // Test getData method
    const data = contactManager.getData();
    console.log("✅ getData method working:", data);

    // Test defaultOptions
    const options = ContactManagerApplication.defaultOptions;
    console.log("✅ defaultOptions available:", options);

  } catch (error) {
    console.error("❌ ContactManagerApplication test failed:", error);
    return false;
  }

  console.log("=== UI tests completed successfully! ===");
  return true;
}

function testContactActorSearchModal() {
  console.log("=== Contact Actor Search Modal Test ===");

  // Get a test actor ID
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length === 0) {
    console.warn("⚠️ No character actors found for testing");
    return false;
  }

  const testActorId = characterActors[0].id;
  console.log(`Using test actor: ${characterActors[0].name} (${testActorId})`);

  try {
    const searchModal = new ContactActorSearchModal(testActorId, null);
    console.log("✅ ContactActorSearchModal instantiation successful");

    // Test getData method
    const data = searchModal.getData();
    console.log("✅ getData method working:", data);

    // Test defaultOptions
    const options = ContactActorSearchModal.defaultOptions;
    console.log("✅ defaultOptions available:", options);

  } catch (error) {
    console.error("❌ ContactActorSearchModal test failed:", error);
    return false;
  }

  console.log("=== Actor Search Modal tests completed successfully! ===");
  return true;
}

function testContactOperations() {
  console.log("=== Contact Operations Test ===");

  // Get test actors
  const characterActors = game.actors.filter(actor => actor.type === 'character');
  if (characterActors.length < 2) {
    console.warn("⚠️ Need at least 2 character actors for testing");
    return false;
  }

  const actor1 = characterActors[0];
  const actor2 = characterActors[1];

  console.log(`Testing with actors: ${actor1.name} and ${actor2.name}`);

  // Test adding a contact
  console.log("Testing addContactToActor...");
  try {
    const result = window.CyberpunkAgent.instance.addContactToActor(actor1.id, actor2.id);
    console.log(`✅ addContactToActor result: ${result}`);

    if (result) {
      // Test getting contacts
      const contacts = window.CyberpunkAgent.instance.getContactsForActor(actor1.id);
      console.log(`✅ getContactsForActor result:`, contacts);

      // Test removing the contact
      console.log("Testing removeContactFromActor...");
      const removeResult = window.CyberpunkAgent.instance.removeContactFromActor(actor1.id, actor2.id);
      console.log(`✅ removeContactFromActor result: ${removeResult}`);
    }

  } catch (error) {
    console.error("❌ Contact operations test failed:", error);
    return false;
  }

  console.log("=== Contact operations tests completed successfully! ===");
  return true;
}

// Main test function
function runAllContactManagerTests() {
  console.log("🚀 Starting Contact Manager comprehensive tests...");

  const results = {
    updates: testContactManagerUpdates(),
    ui: testContactManagerUI(),
    searchModal: testContactActorSearchModal(),
    operations: testContactOperations()
  };

  console.log("=== Test Results Summary ===");
  console.log("Updates System:", results.updates ? "✅ PASS" : "❌ FAIL");
  console.log("UI Components:", results.ui ? "✅ PASS" : "❌ FAIL");
  console.log("Actor Search Modal:", results.searchModal ? "✅ PASS" : "❌ FAIL");
  console.log("Contact Operations:", results.operations ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All tests passed! Contact Manager is working correctly.");
  } else {
    console.log("⚠️ Some tests failed. Check the logs above for details.");
  }

  return allPassed;
}

// Make test functions globally available
window.testContactManagerUpdates = testContactManagerUpdates;
window.testContactManagerUI = testContactManagerUI;
window.testContactActorSearchModal = testContactActorSearchModal;
window.testContactOperations = testContactOperations;
window.runAllContactManagerTests = runAllContactManagerTests;

console.log("Cyberpunk Agent | Contact Manager test functions loaded");
console.log("Run 'runAllContactManagerTests()' to test everything"); 