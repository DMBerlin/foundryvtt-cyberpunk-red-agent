/**
 * Test script to diagnose scroll bar issue
 * Tests why scroll bar disappeared for Player but exists for GM
 */

console.log("Cyberpunk Agent | Testing scroll bar issue...");

/**
 * Test scroll bar visibility and CSS properties
 */
function testScrollBarIssue() {
    console.log("=== Testing Scroll Bar Issue ===");

    // Test 1: Check if Agent interface is open
    const agentWindow = findAgentWindow();
    if (!agentWindow) {
        console.log("❌ No Agent window found - please open an Agent interface first");
        return;
    }

    console.log("✅ Agent window found:", agentWindow.constructor.name);

    // Test 2: Check CSS properties that affect scrolling
    const agentElement = agentWindow.element;
    if (!agentElement) {
        console.log("❌ Agent element not found");
        return;
    }

    console.log("✅ Agent element found");

    // Check main agent container
    const agentContainer = agentElement.find('.cp-agent');
    if (agentContainer.length > 0) {
        const computedStyle = window.getComputedStyle(agentContainer[0]);
        console.log("📊 .cp-agent CSS properties:");
        console.log("  - overflow:", computedStyle.overflow);
        console.log("  - overflow-x:", computedStyle.overflowX);
        console.log("  - overflow-y:", computedStyle.overflowY);
        console.log("  - height:", computedStyle.height);
        console.log("  - max-height:", computedStyle.maxHeight);
    }

    // Check phone container
    const phoneContainer = agentElement.find('.cp-agent-phone');
    if (phoneContainer.length > 0) {
        const computedStyle = window.getComputedStyle(phoneContainer[0]);
        console.log("📊 .cp-agent-phone CSS properties:");
        console.log("  - overflow:", computedStyle.overflow);
        console.log("  - overflow-x:", computedStyle.overflowX);
        console.log("  - overflow-y:", computedStyle.overflowY);
        console.log("  - height:", computedStyle.height);
        console.log("  - max-height:", computedStyle.maxHeight);
    }

    // Check sheet body
    const sheetBody = agentElement.find('.cp-agent .sheet-body');
    if (sheetBody.length > 0) {
        const computedStyle = window.getComputedStyle(sheetBody[0]);
        console.log("📊 .cp-agent .sheet-body CSS properties:");
        console.log("  - overflow:", computedStyle.overflow);
        console.log("  - overflow-x:", computedStyle.overflowX);
        console.log("  - overflow-y:", computedStyle.overflowY);
        console.log("  - height:", computedStyle.height);
        console.log("  - max-height:", computedStyle.maxHeight);
    }

    // Test 3: Check user role and permissions
    console.log("\n👤 User Information:");
    console.log("  - User:", game.user.name);
    console.log("  - Is GM:", game.user.isGM);
    console.log("  - Role:", game.user.role);

    // Test 4: Check if there are any differences in window properties
    console.log("\n🪟 Window Properties:");
    console.log("  - Window ID:", agentWindow.id);
    console.log("  - Window Classes:", agentWindow.element.attr('class'));
    console.log("  - Window Width:", agentWindow.element.width());
    console.log("  - Window Height:", agentWindow.element.height());

    // Test 5: Check for any JavaScript that might be affecting scroll
    console.log("\n🔍 Checking for scroll-related JavaScript...");
    
    // Check if any scroll methods are being called
    const originalScrollTo = Element.prototype.scrollTo;
    let scrollToCalled = false;
    
    Element.prototype.scrollTo = function(...args) {
        scrollToCalled = true;
        console.log("🎯 scrollTo called with:", args);
        return originalScrollTo.apply(this, args);
    };

    // Check if any CSS is being applied dynamically
    const styleSheets = Array.from(document.styleSheets);
    const cyberpunkStyles = styleSheets.filter(sheet => 
        sheet.href && sheet.href.includes('cyberpunk-agent')
    );
    
    console.log("📋 Found Cyberpunk Agent stylesheets:", cyberpunkStyles.length);

    // Test 6: Check if the issue is related to content height
    const phoneScreen = agentElement.find('.cp-phone-screen');
    if (phoneScreen.length > 0) {
        const screenHeight = phoneScreen[0].scrollHeight;
        const containerHeight = phoneScreen[0].clientHeight;
        console.log("\n📏 Content Height Analysis:");
        console.log("  - Content scroll height:", screenHeight);
        console.log("  - Container client height:", containerHeight);
        console.log("  - Needs scroll:", screenHeight > containerHeight);
        
        if (screenHeight <= containerHeight) {
            console.log("⚠️ Content doesn't exceed container - no scroll needed");
        } else {
            console.log("✅ Content exceeds container - scroll should be visible");
        }
    }

    console.log("\n🎯 Scroll bar issue test completed!");
}

/**
 * Find Agent window
 */
function findAgentWindow() {
    const openWindows = Object.values(ui.windows);
    for (const window of openWindows) {
        if (window && window.element && window.element.find('.cp-agent').length > 0) {
            return window;
        }
    }
    return null;
}

/**
 * Test scroll functionality manually
 */
function testManualScroll() {
    console.log("\n=== Testing Manual Scroll ===");
    
    const agentWindow = findAgentWindow();
    if (!agentWindow) {
        console.log("❌ No Agent window found");
        return;
    }

    const agentElement = agentWindow.element;
    
    // Try to scroll the phone screen
    const phoneScreen = agentElement.find('.cp-phone-screen');
    if (phoneScreen.length > 0) {
        console.log("✅ Testing scroll on .cp-phone-screen");
        
        // Check current scroll position
        const currentScrollTop = phoneScreen[0].scrollTop;
        console.log("  - Current scroll top:", currentScrollTop);
        
        // Try to scroll down
        phoneScreen[0].scrollTop = 100;
        console.log("  - Set scroll top to 100");
        
        // Check if scroll position changed
        const newScrollTop = phoneScreen[0].scrollTop;
        console.log("  - New scroll top:", newScrollTop);
        console.log("  - Scroll worked:", newScrollTop !== currentScrollTop);
    }

    // Try to scroll the main agent container
    const agentContainer = agentElement.find('.cp-agent');
    if (agentContainer.length > 0) {
        console.log("✅ Testing scroll on .cp-agent");
        
        const currentScrollTop = agentContainer[0].scrollTop;
        console.log("  - Current scroll top:", currentScrollTop);
        
        agentContainer[0].scrollTop = 100;
        console.log("  - Set scroll top to 100");
        
        const newScrollTop = agentContainer[0].scrollTop;
        console.log("  - New scroll top:", newScrollTop);
        console.log("  - Scroll worked:", newScrollTop !== currentScrollTop);
    }
}

/**
 * Test CSS override to fix scroll
 */
function testCSSFix() {
    console.log("\n=== Testing CSS Fix ===");
    
    const agentWindow = findAgentWindow();
    if (!agentWindow) {
        console.log("❌ No Agent window found");
        return;
    }

    const agentElement = agentWindow.element;
    
    // Try to override CSS to enable scroll
    const phoneContainer = agentElement.find('.cp-agent-phone');
    if (phoneContainer.length > 0) {
        console.log("✅ Applying CSS fix to .cp-agent-phone");
        phoneContainer.css({
            'overflow-y': 'auto',
            'overflow-x': 'hidden'
        });
        console.log("  - Applied overflow-y: auto");
        console.log("  - Applied overflow-x: hidden");
    }

    const agentContainer = agentElement.find('.cp-agent');
    if (agentContainer.length > 0) {
        console.log("✅ Applying CSS fix to .cp-agent");
        agentContainer.css({
            'overflow-y': 'auto',
            'overflow-x': 'hidden'
        });
        console.log("  - Applied overflow-y: auto");
        console.log("  - Applied overflow-x: hidden");
    }

    console.log("🎯 CSS fix applied - check if scroll bar appears");
}

// Run all tests
testScrollBarIssue();
testManualScroll();
testCSSFix();

console.log("\n🎯 All scroll bar tests completed!");
console.log("📝 Summary: Check console output for detailed analysis"); 