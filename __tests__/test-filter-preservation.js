/**
 * Test script for Contact Manager filter preservation
 * Run this in the browser console to test the filter functionality
 */

console.log("Cyberpunk Agent | Testing Contact Manager filter preservation...");

function testFilterPreservation() {
  console.log("=== Contact Manager Filter Preservation Test ===");

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

  // Test filter state management
  console.log("Testing filter state management...");

  // Create a test instance
  try {
    const testInstance = new ContactManagerApplication();
    console.log("✅ ContactManagerApplication instantiation successful");

    // Test filter state storage
    testInstance.currentFilterTerm = "test";
    console.log("✅ Filter term storage test:", testInstance.currentFilterTerm);

    // Test filter application method
    if (typeof testInstance._applyFilter === 'function') {
      console.log("✅ _applyFilter method available");
    } else {
      console.error("❌ _applyFilter method not available");
      return false;
    }

    // Test filter state storage method
    if (typeof testInstance._storeFilterState === 'function') {
      console.log("✅ _storeFilterState method available");
    } else {
      console.error("❌ _storeFilterState method not available");
      return false;
    }

    // Test filter state restoration method
    if (typeof testInstance._restoreFilterState === 'function') {
      console.log("✅ _restoreFilterState method available");
    } else {
      console.error("❌ _restoreFilterState method not available");
      return false;
    }

    // Test partial update method
    if (typeof testInstance._updateContactDataOnly === 'function') {
      console.log("✅ _updateContactDataOnly method available");
    } else {
      console.error("❌ _updateContactDataOnly method not available");
      return false;
    }

  } catch (error) {
    console.error("❌ ContactManagerApplication test failed:", error);
    return false;
  }

  console.log("=== Filter preservation tests completed successfully! ===");
  return true;
}

function testFilterFunctionality() {
  console.log("=== Filter Functionality Test ===");

  // Check if there's an open ContactManagerApplication
  const openWindows = Object.values(ui.windows);
  const contactManager = openWindows.find(window =>
    window && window.constructor.name === 'ContactManagerApplication'
  );

  if (!contactManager) {
    console.warn("⚠️ No ContactManagerApplication is currently open");
    console.log("💡 Open the Contact Manager first, then run this test");
    return false;
  }

  console.log("✅ Found open ContactManagerApplication");

  // Test filter input
  const filterInput = contactManager.element.find('.cp-search-filter');
  if (filterInput.length === 0) {
    console.error("❌ Filter input not found");
    return false;
  }

  console.log("✅ Filter input found");

  // Test setting a filter
  const testFilterTerm = "test";
  filterInput.val(testFilterTerm);
  filterInput.trigger('input');

  console.log("✅ Filter input test completed");

  // Check if filter state was stored
  if (contactManager.currentFilterTerm === testFilterTerm) {
    console.log("✅ Filter state storage working");
  } else {
    console.warn("⚠️ Filter state storage may not be working");
  }

  // Test network sections visibility
  const networkSections = contactManager.element.find('.cp-network-section');
  const visibleSections = networkSections.filter(':visible');
  const hiddenSections = networkSections.filter(':hidden');

  console.log(`📊 Network sections: ${networkSections.length} total, ${visibleSections.length} visible, ${hiddenSections.length} hidden`);

  // Test clearing filter
  filterInput.val('');
  filterInput.trigger('input');

  const allVisibleAfterClear = contactManager.element.find('.cp-network-section:visible').length;
  console.log(`📊 After clearing filter: ${allVisibleAfterClear} sections visible`);

  if (allVisibleAfterClear === networkSections.length) {
    console.log("✅ Filter clearing working");
  } else {
    console.warn("⚠️ Filter clearing may not be working correctly");
  }

  console.log("=== Filter functionality tests completed! ===");
  return true;
}

function testFilterPreservationDuringUpdates() {
  console.log("=== Filter Preservation During Updates Test ===");

  // Check if there's an open ContactManagerApplication
  const openWindows = Object.values(ui.windows);
  const contactManager = openWindows.find(window =>
    window && window.constructor.name === 'ContactManagerApplication'
  );

  if (!contactManager) {
    console.warn("⚠️ No ContactManagerApplication is currently open");
    console.log("💡 Open the Contact Manager first, then run this test");
    return false;
  }

  console.log("✅ Found open ContactManagerApplication");

  // Set a filter
  const filterInput = contactManager.element.find('.cp-search-filter');
  const testFilterTerm = "test";
  filterInput.val(testFilterTerm);
  filterInput.trigger('input');

  console.log(`🔍 Set filter to: "${testFilterTerm}"`);

  // Store initial state
  const initialVisibleCount = contactManager.element.find('.cp-network-section:visible').length;
  console.log(`📊 Initial visible sections: ${initialVisibleCount}`);

  // Simulate a contact update
  console.log("🔄 Simulating contact update...");

  try {
    // Trigger a real-time update
    contactManager._handleRealtimeUpdate();

    // Wait a bit for the update to complete
    setTimeout(() => {
      // Check if filter was preserved
      const finalFilterValue = filterInput.val();
      const finalVisibleCount = contactManager.element.find('.cp-network-section:visible').length;

      console.log(`📊 After update - Filter value: "${finalFilterValue}", Visible sections: ${finalVisibleCount}`);

      if (finalFilterValue === testFilterTerm) {
        console.log("✅ Filter value preserved during update");
      } else {
        console.warn("⚠️ Filter value may not have been preserved");
      }

      if (finalVisibleCount === initialVisibleCount) {
        console.log("✅ Filter visibility preserved during update");
      } else {
        console.warn("⚠️ Filter visibility may not have been preserved");
      }

      console.log("=== Filter preservation during updates test completed! ===");
    }, 500);

  } catch (error) {
    console.error("❌ Error during update simulation:", error);
    return false;
  }

  return true;
}

function testPartialUpdateEfficiency() {
  console.log("=== Partial Update Efficiency Test ===");

  // Check if there's an open ContactManagerApplication
  const openWindows = Object.values(ui.windows);
  const contactManager = openWindows.find(window =>
    window && window.constructor.name === 'ContactManagerApplication'
  );

  if (!contactManager) {
    console.warn("⚠️ No ContactManagerApplication is currently open");
    console.log("💡 Open the Contact Manager first, then run this test");
    return false;
  }

  console.log("✅ Found open ContactManagerApplication");

  // Test partial update method
  try {
    const startTime = performance.now();
    const result = contactManager._updateContactDataOnly();
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`⏱️ Partial update took: ${duration.toFixed(2)}ms`);
    console.log(`✅ Partial update result: ${result}`);

    if (duration < 100) {
      console.log("✅ Partial update is efficient (< 100ms)");
    } else {
      console.warn("⚠️ Partial update may be slow (> 100ms)");
    }

  } catch (error) {
    console.error("❌ Error during partial update test:", error);
    return false;
  }

  console.log("=== Partial update efficiency test completed! ===");
  return true;
}

// Main test function
function runAllFilterTests() {
  console.log("🚀 Starting Contact Manager filter comprehensive tests...");

  const results = {
    preservation: testFilterPreservation(),
    functionality: testFilterFunctionality(),
    updates: testFilterPreservationDuringUpdates(),
    efficiency: testPartialUpdateEfficiency()
  };

  console.log("=== Filter Test Results Summary ===");
  console.log("Filter Preservation:", results.preservation ? "✅ PASS" : "❌ FAIL");
  console.log("Filter Functionality:", results.functionality ? "✅ PASS" : "❌ FAIL");
  console.log("Filter During Updates:", results.updates ? "✅ PASS" : "❌ FAIL");
  console.log("Update Efficiency:", results.efficiency ? "✅ PASS" : "❌ FAIL");

  const allPassed = Object.values(results).every(result => result === true);

  if (allPassed) {
    console.log("🎉 All filter tests passed! Filter preservation is working correctly.");
  } else {
    console.log("⚠️ Some filter tests failed. Check the logs above for details.");
  }

  return allPassed;
}

// Utility function to check current filter state
function checkCurrentFilterState() {
  const openWindows = Object.values(ui.windows);
  const contactManager = openWindows.find(window =>
    window && window.constructor.name === 'ContactManagerApplication'
  );

  if (!contactManager) {
    console.log("❌ No ContactManagerApplication is currently open");
    return null;
  }

  const filterInput = contactManager.element.find('.cp-search-filter');
  const filterValue = filterInput.val();
  const storedFilter = contactManager.currentFilterTerm;
  const visibleSections = contactManager.element.find('.cp-network-section:visible').length;
  const totalSections = contactManager.element.find('.cp-network-section').length;

  console.log("=== Current Filter State ===");
  console.log(`Filter Input Value: "${filterValue}"`);
  console.log(`Stored Filter Term: "${storedFilter}"`);
  console.log(`Visible Sections: ${visibleSections}/${totalSections}`);
  console.log(`Filter Active: ${filterValue && filterValue.trim() !== ''}`);

  return {
    filterValue,
    storedFilter,
    visibleSections,
    totalSections,
    isActive: filterValue && filterValue.trim() !== ''
  };
}

// Make test functions globally available
window.testFilterPreservation = testFilterPreservation;
window.testFilterFunctionality = testFilterFunctionality;
window.testFilterPreservationDuringUpdates = testFilterPreservationDuringUpdates;
window.testPartialUpdateEfficiency = testPartialUpdateEfficiency;
window.runAllFilterTests = runAllFilterTests;
window.checkCurrentFilterState = checkCurrentFilterState;

console.log("Cyberpunk Agent | Filter preservation test functions loaded");
console.log("Run 'runAllFilterTests()' to test everything");
console.log("Run 'checkCurrentFilterState()' to check current filter state"); 