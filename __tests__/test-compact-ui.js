/**
 * Test script for compact Contact Manager UI
 * This script helps test the compact interface functionality
 */

console.log("Cyberpunk Agent | Loading test-compact-ui.js...");

/**
 * Test compact Contact Manager interface
 */
function testCompactContactManager() {
  console.log("=== Testing Compact Contact Manager UI ===");

  if (!game.user.isGM) {
    console.log("Skipped: Only GM can access Contact Manager");
    return;
  }

  try {
    const ContactClass = ContactManagerApplication || window.ContactManagerApplication;
    if (typeof ContactClass === 'undefined') {
      console.error("ContactManagerApplication not available!");
      return;
    }

    console.log("Creating compact ContactManagerApplication instance...");
    const contactManager = new ContactClass();
    console.log("Instance created successfully!");

    console.log("Rendering compact application...");
    contactManager.render(true);
    console.log("Compact application rendered!");

    // Check if compact elements are present
    setTimeout(() => {
      const compactElements = [
        '.cp-config-header-compact',
        '.cp-search-section',
        '.cp-networks-container-compact',
        '.cp-network-section-compact',
        '.cp-actor-header-compact',
        '.cp-add-contact-btn-compact',
        '.cp-contact-chip-compact'
      ];

      compactElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`✓ Found compact element: ${selector}`);
        } else {
          console.warn(`✗ Missing compact element: ${selector}`);
        }
      });

      // Check window size
      const windowElement = document.querySelector('.contact-manager');
      if (windowElement) {
        const rect = windowElement.getBoundingClientRect();
        console.log(`Window size: ${rect.width}x${rect.height}`);
        console.log(`Target size: 800x600`);
      }

      // Check contact chips layout
      const contactChips = document.querySelectorAll('.cp-contact-chip-compact');
      console.log(`Found ${contactChips.length} contact chips`);

      if (contactChips.length > 0) {
        const firstChip = contactChips[0];
        const chipRect = firstChip.getBoundingClientRect();
        console.log(`Contact chip size: ${chipRect.width.toFixed(1)}x${chipRect.height.toFixed(1)}px`);
      }

    }, 1000);

  } catch (error) {
    console.error("Error testing compact ContactManagerApplication:", error);
  }

  console.log("=== End Test ===");
}

/**
 * Compare compact vs original interface
 */
function compareInterfaces() {
  console.log("=== Comparing Interface Sizes ===");

  const interfaces = {
    'ContactManager': {
      width: 800,
      height: 600,
      description: 'Compact version'
    },
    'AgentHome': {
      width: 400,
      height: 700,
      description: 'Agent home'
    },
    'Chat7': {
      width: 400,
      height: 700,
      description: 'Chat interface'
    }
  };

  Object.entries(interfaces).forEach(([name, config]) => {
    console.log(`${name}: ${config.width}x${config.height} - ${config.description}`);
  });

  console.log("=== End Comparison ===");
}

/**
 * Test responsive behavior
 */
function testResponsiveBehavior() {
  console.log("=== Testing Responsive Behavior ===");

  // Simulate different screen sizes
  const screenSizes = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1366, height: 768, name: 'Laptop' },
    { width: 1024, height: 768, name: 'Tablet' },
    { width: 768, height: 1024, name: 'Mobile Portrait' }
  ];

  screenSizes.forEach(size => {
    console.log(`${size.name} (${size.width}x${size.height}):`);

    // Calculate if ContactManager would fit
    const fitsWidth = size.width >= 800;
    const fitsHeight = size.height >= 600;
    const fits = fitsWidth && fitsHeight;

    console.log(`  - Width: ${fitsWidth ? '✓' : '✗'} (needs 800px, has ${size.width}px)`);
    console.log(`  - Height: ${fitsHeight ? '✓' : '✗'} (needs 600px, has ${size.height}px)`);
    console.log(`  - Overall: ${fits ? '✓ Fits' : '✗ Too small'}`);
  });

  console.log("=== End Responsive Test ===");
}

/**
 * Measure current interface elements
 */
function measureInterfaceElements() {
  console.log("=== Measuring Interface Elements ===");

  const elements = [
    '.cp-config-header-compact',
    '.cp-networks-container-compact',
    '.cp-network-section-compact',
    '.cp-actor-header-compact',
    '.cp-selected-contacts-compact'
  ];

  elements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      console.log(`${selector}:`);
      console.log(`  - Size: ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}px`);
      console.log(`  - Padding: ${computedStyle.padding}`);
      console.log(`  - Margin: ${computedStyle.margin}`);
    } else {
      console.log(`${selector}: Not found`);
    }
  });

  console.log("=== End Measurement ===");
}

// Make test functions globally available
window.testCompactContactManager = testCompactContactManager;
window.compareInterfaces = compareInterfaces;
window.testResponsiveBehavior = testResponsiveBehavior;
window.measureInterfaceElements = measureInterfaceElements;

console.log("Cyberpunk Agent | Compact UI test functions made globally available");
console.log("Available functions:");
console.log("  - testCompactContactManager()");
console.log("  - compareInterfaces()");
console.log("  - testResponsiveBehavior()");
console.log("  - measureInterfaceElements()"); 