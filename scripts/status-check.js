/**
 * Status Check Script for Cyberpunk Agent
 * Quick verification of real-time update system
 */

console.log("Cyberpunk Agent | Loading status-check.js...");

/**
 * Quick status check for the real-time update system
 */
function checkRealtimeStatus() {
  console.log("=== Cyberpunk Agent Real-time Status Check ===");

  // Check 1: Module instance
  if (!window.CyberpunkAgent?.instance) {
    console.error("✗ Cyberpunk Agent instance not available");
    console.log("💡 Try running this check again in a few seconds");
    return false;
  }
  console.log("✓ Cyberpunk Agent instance available");

  const agent = window.CyberpunkAgent.instance;

  // Check 2: Socket communication
  const socketAvailable = !!game.socket;
  console.log(`Socket: ${socketAvailable ? '✓' : '✗'}`);

  // Check 3: Required methods
  const requiredMethods = [
    'updateOpenInterfaces',
    'notifyContactUpdate',
    'handleContactUpdate',
    'hasOpenInterfaces',
    'getOpenInterfacesCount',
    'setupSocketCommunication'
  ];

  let methodsOk = true;
  requiredMethods.forEach(method => {
    const available = typeof agent[method] === 'function';
    console.log(`${method}: ${available ? '✓' : '✗'}`);
    if (!available) methodsOk = false;
  });

  // Check 4: Open interfaces
  const openCount = agent.getOpenInterfacesCount();
  const hasOpen = agent.hasOpenInterfaces();
  console.log(`Open interfaces: ${openCount} (has open: ${hasOpen})`);

  // Check 5: User permissions
  console.log(`Is GM: ${game.user.isGM ? '✓' : '✗'}`);

  // Check 6: Contact data
  try {
    const testActor = game.actors.find(actor => actor.type === 'character');
    if (testActor) {
      const contacts = agent.getContactsForActor(testActor.id);
      console.log(`Test actor contacts: ${contacts.length}`);
    }
  } catch (error) {
    console.warn("Could not check contact data:", error);
  }

  const overallStatus = socketAvailable && methodsOk;
  console.log(`=== Overall Status: ${overallStatus ? '✓ READY' : '✗ ISSUES DETECTED'} ===`);

  return overallStatus;
}

/**
 * Test real-time update functionality
 */
function testRealtimeFunctionality() {
  console.log("=== Testing Real-time Functionality ===");

  if (!window.CyberpunkAgent?.instance) {
    console.error("Cyberpunk Agent instance not available");
    return;
  }

  const agent = window.CyberpunkAgent.instance;

  // Test 1: Interface update
  console.log("Test 1: Testing interface update...");
  try {
    agent.updateOpenInterfaces();
    console.log("✓ Interface update test passed");
  } catch (error) {
    console.error("✗ Interface update test failed:", error);
  }

  // Test 2: Socket notification (GM only)
  if (game.user.isGM) {
    console.log("Test 2: Testing socket notification...");
    try {
      agent.notifyContactUpdate();
      console.log("✓ Socket notification test passed");
    } catch (error) {
      console.error("✗ Socket notification test failed:", error);
    }
  } else {
    console.log("Test 2: Skipped (not GM)");
  }

  // Test 3: Contact data access
  console.log("Test 3: Testing contact data access...");
  try {
    const characterActors = game.actors.filter(actor => actor.type === 'character');
    if (characterActors.length > 0) {
      const contacts = agent.getContactsForActor(characterActors[0].id);
      console.log(`✓ Contact data access test passed (${contacts.length} contacts)`);
    } else {
      console.log("✓ Contact data access test passed (no character actors)");
    }
  } catch (error) {
    console.error("✗ Contact data access test failed:", error);
  }

  console.log("=== Functionality Test Complete ===");
}

/**
 * Monitor system for a short period
 */
function quickMonitor() {
  console.log("=== Quick System Monitor (30 seconds) ===");

  let checkCount = 0;
  const maxChecks = 6; // 30 seconds total (5 second intervals)

  const monitorInterval = setInterval(() => {
    checkCount++;

    if (window.CyberpunkAgent?.instance) {
      const openCount = window.CyberpunkAgent.instance.getOpenInterfacesCount();
      console.log(`Check ${checkCount}/${maxChecks}: ${openCount} open interfaces`);
    } else {
      console.log(`Check ${checkCount}/${maxChecks}: Instance not available`);
    }

    if (checkCount >= maxChecks) {
      clearInterval(monitorInterval);
      console.log("=== Quick Monitor Complete ===");
    }
  }, 5000);

  // Store interval for manual stop
  window.quickMonitorInterval = monitorInterval;
}

/**
 * Stop quick monitor
 */
function stopQuickMonitor() {
  if (window.quickMonitorInterval) {
    clearInterval(window.quickMonitorInterval);
    delete window.quickMonitorInterval;
    console.log("Quick monitor stopped");
  } else {
    console.log("No quick monitor active");
  }
}

/**
 * Comprehensive system check
 */
function comprehensiveCheck() {
  console.log("=== Comprehensive System Check ===");

  // Step 1: Basic status
  const basicStatus = checkRealtimeStatus();
  
  if (!basicStatus) {
    console.error("Basic status check failed. Stopping comprehensive check.");
    return false;
  }

  // Step 2: Functionality test
  testRealtimeFunctionality();

  // Step 3: Quick monitor
  console.log("Starting 30-second monitor...");
  quickMonitor();

  // Step 4: Auto-stop monitor after 35 seconds
  setTimeout(() => {
    stopQuickMonitor();
    console.log("=== Comprehensive Check Complete ===");
  }, 35000);

  return true;
}

/**
 * Safe status check that won't fail if instance is not ready
 */
function safeStatusCheck() {
  console.log("=== Safe Status Check ===");
  
  // Check if FoundryVTT is ready
  if (!game || !game.modules) {
    console.log("⚠ FoundryVTT not ready yet");
    return false;
  }
  
  // Check if module is loaded
  const module = game.modules.get('cyberpunk-agent');
  if (!module || !module.active) {
    console.log("✗ Cyberpunk Agent module not loaded or not active");
    return false;
  }
  console.log("✓ Cyberpunk Agent module is active");

  // Check if instance is available
  if (!window.CyberpunkAgent?.instance) {
    console.log("⚠ Cyberpunk Agent instance not ready yet");
    console.log("💡 This is normal during module loading");
    return false;
  }
  console.log("✓ Cyberpunk Agent instance is ready");

  // If we get here, run the full check
  return checkRealtimeStatus();
}

// Make functions globally available
window.checkRealtimeStatus = checkRealtimeStatus;
window.testRealtimeFunctionality = testRealtimeFunctionality;
window.quickMonitor = quickMonitor;
window.stopQuickMonitor = stopQuickMonitor;
window.comprehensiveCheck = comprehensiveCheck;
window.safeStatusCheck = safeStatusCheck;

/**
 * Check module loading status
 */
function checkModuleLoading() {
  console.log("=== Module Loading Status ===");
  
  console.log("FoundryVTT ready:", !!game);
  console.log("Game modules available:", !!game?.modules);
  
  if (game?.modules) {
    const module = game.modules.get('cyberpunk-agent');
    console.log("Module found:", !!module);
    console.log("Module active:", module?.active);
    console.log("Module version:", module?.version);
  }
  
  console.log("CyberpunkAgent class available:", typeof window.CyberpunkAgent);
  console.log("CyberpunkAgent instance available:", !!window.CyberpunkAgent?.instance);
  
  if (window.CyberpunkAgent?.instance) {
    console.log("Instance methods available:", {
      updateOpenInterfaces: typeof window.CyberpunkAgent.instance.updateOpenInterfaces,
      notifyContactUpdate: typeof window.CyberpunkAgent.instance.notifyContactUpdate,
      hasOpenInterfaces: typeof window.CyberpunkAgent.instance.hasOpenInterfaces
    });
  }
  
  console.log("=== Loading Status Complete ===");
}

window.checkModuleLoading = checkModuleLoading;

console.log("Cyberpunk Agent | Status check functions made globally available");

// Auto-run basic check on load with retry mechanism
function runAutoStatusCheck() {
  console.log("Cyberpunk Agent | Running auto status check...");
  
  const result = safeStatusCheck();
  
  if (!result && window.CyberpunkAgent?.instance) {
    // If safe check failed but instance is available, try full check
    checkRealtimeStatus();
  } else if (!result) {
    // If still not ready, retry
    console.log("Cyberpunk Agent | Module not ready yet, retrying in 3 seconds...");
    setTimeout(runAutoStatusCheck, 3000);
  }
}

// Hook to run status check after module is ready
Hooks.once('ready', () => {
  console.log("Cyberpunk Agent | FoundryVTT ready, scheduling status check...");
  setTimeout(runAutoStatusCheck, 2000);
});

// Fallback: Start auto check after a longer delay to ensure module is loaded
setTimeout(runAutoStatusCheck, 8000); 