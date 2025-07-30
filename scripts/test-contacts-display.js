/**
 * Test Script: Contacts Display Issue
 * Diagnoses why contacts are not showing in the Chat7 list
 */

console.log("Cyberpunk Agent | Running contacts display test...");

// Test function to diagnose contacts display issue
async function testContactsDisplay() {
    console.log("=== Contacts Display Test ===");
    
    try {
        // Check if CyberpunkAgent instance exists
        if (!window.CyberpunkAgent?.instance) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }
        console.log("✅ CyberpunkAgent instance found");
        
        // Get user actors
        const userActors = window.CyberpunkAgent.instance.getUserActors() || [];
        if (userActors.length === 0) {
            console.error("❌ No user actors found");
            return false;
        }
        
        const testActor = userActors[0];
        console.log(`✅ Using actor for testing: ${testActor.name} (${testActor.id})`);
        
        // Test 1: Check if contact networks are loaded
        console.log("🔄 Test 1: Checking contact networks...");
        const contactNetworks = window.CyberpunkAgent.instance.contactNetworks;
        console.log(`✅ Contact networks Map size: ${contactNetworks.size}`);
        
        // Check if the actor has any contacts in the network
        const actorContacts = contactNetworks.get(testActor.id);
        console.log(`✅ Actor contacts in network:`, actorContacts);
        
        // Test 2: Check getContactsForActor function
        console.log("🔄 Test 2: Testing getContactsForActor...");
        const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
        console.log(`✅ getContactsForActor result:`, contacts);
        console.log(`✅ Number of contacts: ${contacts.length}`);
        
        // Test 3: Check getAnonymousContactsForActor function
        console.log("🔄 Test 3: Testing getAnonymousContactsForActor...");
        const anonymousContacts = window.CyberpunkAgent.instance.getAnonymousContactsForActor(testActor.id);
        console.log(`✅ getAnonymousContactsForActor result:`, anonymousContacts);
        console.log(`✅ Number of anonymous contacts: ${anonymousContacts.length}`);
        
        // Test 4: Check combined contacts
        console.log("🔄 Test 4: Testing combined contacts...");
        const allContacts = [...contacts, ...anonymousContacts];
        console.log(`✅ Total contacts (regular + anonymous): ${allContacts.length}`);
        
        // Test 5: Check if data is loaded from settings
        console.log("🔄 Test 5: Checking settings data...");
        const savedContactNetworks = game.settings.get('cyberpunk-agent', 'contact-networks') || {};
        console.log(`✅ Saved contact networks:`, savedContactNetworks);
        console.log(`✅ Number of saved networks: ${Object.keys(savedContactNetworks).length}`);
        
        // Check if our actor is in the saved data
        const savedActorContacts = savedContactNetworks[testActor.id];
        console.log(`✅ Saved contacts for actor:`, savedActorContacts);
        
        // Test 6: Check if mute system is initialized
        console.log("🔄 Test 6: Checking mute system...");
        const muteSystem = window.CyberpunkAgent.instance._userMuteSettings;
        console.log(`✅ Mute system initialized:`, muteSystem ? 'Yes' : 'No');
        
        // Test 7: Check if AgentApplication is working correctly
        console.log("🔄 Test 7: Testing AgentApplication contact rendering...");
        if (typeof AgentApplication !== 'undefined') {
            const agentApp = new AgentApplication(testActor);
            console.log(`✅ AgentApplication created successfully`);
            
            // Test the _renderChat7View method
            console.log("🔄 Testing _renderChat7View method...");
            
            // Mock the element and contactList for testing
            const mockElement = {
                find: (selector) => {
                    if (selector === '.cp-contact-list') {
                        return {
                            length: 1,
                            empty: () => console.log("Mock: contactList.empty() called"),
                            append: (html) => console.log("Mock: contactList.append() called with:", html)
                        };
                    }
                    return { length: 0 };
                }
            };
            
            // Temporarily replace the element for testing
            const originalElement = agentApp.element;
            agentApp.element = mockElement;
            
            // Call the method
            agentApp._renderChat7View();
            
            // Restore original element
            agentApp.element = originalElement;
            
            console.log(`✅ _renderChat7View method executed successfully`);
        } else {
            console.error("❌ AgentApplication not available");
        }
        
        // Test 8: Check if there are any open Agent applications
        console.log("🔄 Test 8: Checking open Agent applications...");
        const openWindows = Object.values(ui.windows);
        const agentWindows = openWindows.filter(window => 
            window && window.constructor.name === 'AgentApplication'
        );
        console.log(`✅ Open Agent applications: ${agentWindows.length}`);
        
        // Test 9: Check if the issue is with the template
        console.log("🔄 Test 9: Checking template structure...");
        const templatePath = "modules/cyberpunk-agent/templates/chat7.html";
        console.log(`✅ Template path: ${templatePath}`);
        
        // Test 10: Check if the issue is with the DOM structure
        console.log("🔄 Test 10: Checking DOM structure...");
        const contactListElements = document.querySelectorAll('.cp-contact-list');
        console.log(`✅ .cp-contact-list elements found: ${contactListElements.length}`);
        
        // Test 11: Check if the issue is with the data flow
        console.log("🔄 Test 11: Checking data flow...");
        console.log(`✅ Actor ID: ${testActor.id}`);
        console.log(`✅ Actor Name: ${testActor.name}`);
        console.log(`✅ User ID: ${game.user.id}`);
        console.log(`✅ User Name: ${game.user.name}`);
        console.log(`✅ Is GM: ${game.user.isGM}`);
        
        // Test 12: Check if the issue is with the initialization
        console.log("🔄 Test 12: Checking initialization...");
        const isInitialized = window.CyberpunkAgent.instance._isInitialized;
        console.log(`✅ Module initialized: ${isInitialized}`);
        
        // Test 13: Check if the issue is with the data loading
        console.log("🔄 Test 13: Checking data loading...");
        console.log(`✅ Agent data Map size: ${window.CyberpunkAgent.instance.agentData.size}`);
        console.log(`✅ Messages Map size: ${window.CyberpunkAgent.instance.messages.size}`);
        
        // Summary
        console.log("=== Summary ===");
        console.log(`📊 Total contacts available: ${allContacts.length}`);
        console.log(`📊 Regular contacts: ${contacts.length}`);
        console.log(`📊 Anonymous contacts: ${anonymousContacts.length}`);
        console.log(`📊 Contact networks loaded: ${contactNetworks.size}`);
        console.log(`📊 Settings networks: ${Object.keys(savedContactNetworks).length}`);
        
        if (allContacts.length === 0) {
            console.warn("⚠️ No contacts found - this might be the issue!");
            console.warn("💡 Possible causes:");
            console.warn("   1. No contacts configured in Contact Manager");
            console.warn("   2. Contacts not saved properly");
            console.warn("   3. Data not loaded correctly");
            console.warn("   4. Actor ID mismatch");
        } else {
            console.log("✅ Contacts are available - the issue might be in the rendering");
        }
        
        return true;
        
    } catch (error) {
        console.error("❌ Contacts display test failed:", error);
        return false;
    }
}

// Test function to check Contact Manager data
async function testContactManagerData() {
    console.log("=== Contact Manager Data Test ===");
    
    try {
        // Check if ContactManagerApplication is available
        if (typeof ContactManagerApplication === 'undefined') {
            console.error("❌ ContactManagerApplication not available");
            return false;
        }
        
        // Get user actors
        const userActors = window.CyberpunkAgent?.instance?.getUserActors() || [];
        if (userActors.length === 0) {
            console.error("❌ No user actors found");
            return false;
        }
        
        const testActor = userActors[0];
        
        // Create a ContactManagerApplication instance to test data
        const contactManager = new ContactManagerApplication(testActor);
        console.log(`✅ ContactManagerApplication created for actor: ${testActor.name}`);
        
        // Get the data that would be used for rendering
        const data = contactManager.getData();
        console.log(`✅ ContactManager data:`, data);
        
        // Check if contacts are in the data
        if (data.contacts && Array.isArray(data.contacts)) {
            console.log(`✅ Contacts in data: ${data.contacts.length}`);
            data.contacts.forEach((contact, index) => {
                console.log(`   Contact ${index + 1}: ${contact.name} (${contact.id})`);
            });
        } else {
            console.warn("⚠️ No contacts array in ContactManager data");
        }
        
        return true;
        
    } catch (error) {
        console.error("❌ Contact Manager data test failed:", error);
        return false;
    }
}

// Test function to force reload data
async function testForceReloadData() {
    console.log("=== Force Reload Data Test ===");
    
    try {
        if (!window.CyberpunkAgent?.instance) {
            console.error("❌ CyberpunkAgent instance not found");
            return false;
        }
        
        // Force reload all data
        console.log("🔄 Forcing data reload...");
        window.CyberpunkAgent.instance.loadAgentData();
        
        // Get user actors
        const userActors = window.CyberpunkAgent.instance.getUserActors() || [];
        if (userActors.length === 0) {
            console.error("❌ No user actors found");
            return false;
        }
        
        const testActor = userActors[0];
        
        // Check contacts after reload
        const contacts = window.CyberpunkAgent.instance.getContactsForActor(testActor.id);
        const anonymousContacts = window.CyberpunkAgent.instance.getAnonymousContactsForActor(testActor.id);
        const allContacts = [...contacts, ...anonymousContacts];
        
        console.log(`✅ Contacts after reload: ${allContacts.length}`);
        console.log(`✅ Regular contacts: ${contacts.length}`);
        console.log(`✅ Anonymous contacts: ${anonymousContacts.length}`);
        
        return true;
        
    } catch (error) {
        console.error("❌ Force reload test failed:", error);
        return false;
    }
}

// Run all tests
async function runAllContactsTests() {
    console.log("🚀 Starting contacts display tests...");
    
    const test1 = await testContactsDisplay();
    const test2 = await testContactManagerData();
    const test3 = await testForceReloadData();
    
    if (test1 && test2 && test3) {
        console.log("🎉 All contacts display tests completed!");
        ui.notifications.info("Contacts display test: COMPLETED");
    } else {
        console.error("💥 Some contacts display tests failed!");
        ui.notifications.error("Contacts display test: FAILED");
    }
}

// Export for manual testing
window.testContactsDisplay = testContactsDisplay;
window.testContactManagerData = testContactManagerData;
window.testForceReloadData = testForceReloadData;
window.runAllContactsTests = runAllContactsTests;

// Auto-run if this script is executed directly
if (typeof module === 'undefined') {
    // Running in browser context
    runAllContactsTests();
} 