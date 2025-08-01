/**
 * Test Actor Isolation for Mute Settings and Message History
 * 
 * This script tests that:
 * 1. Mute settings are isolated per actor
 * 2. Message history clearing is isolated per actor
 * 3. When GM opens agent for actor A and mutes contacts E and F,
 *    then opens agent for actor B, contacts E and F should be unmuted
 * 4. When actor A clears conversation history with actor E,
 *    actor B's conversation history with actor E should remain intact
 */

console.log("=== Cyberpunk Agent | Testing Actor Isolation ===");

async function testActorIsolation() {
  try {
    const agent = window.CyberpunkAgent?.instance;
    if (!agent) {
      console.error("Cyberpunk Agent instance not found!");
      return;
    }

    console.log("1. Testing Mute Settings Isolation...");
    await testMuteSettingsIsolation(agent);

    console.log("2. Testing Message History Isolation...");
    await testMessageHistoryIsolation(agent);

    console.log("=== All tests completed ===");
  } catch (error) {
    console.error("Error during actor isolation tests:", error);
  }
}

async function testMuteSettingsIsolation(agent) {
  console.log("--- Testing Mute Settings Isolation ---");

  // Create test actors if they don't exist
  const actorA = await createTestActor("TestActorA", "Actor A");
  const actorB = await createTestActor("TestActorB", "Actor B");
  const contactE = await createTestActor("TestContactE", "Contact E");
  const contactF = await createTestActor("TestContactF", "Contact F");

  // Add contacts to both actors
  agent.addContactToActor(actorA.id, contactE.id);
  agent.addContactToActor(actorA.id, contactF.id);
  agent.addContactToActor(actorB.id, contactE.id);
  agent.addContactToActor(actorB.id, contactF.id);

  console.log("Initial mute status:");
  console.log(`  Actor A - Contact E muted: ${agent.isContactMuted(actorA.id, contactE.id)}`);
  console.log(`  Actor A - Contact F muted: ${agent.isContactMuted(actorA.id, contactF.id)}`);
  console.log(`  Actor B - Contact E muted: ${agent.isContactMuted(actorB.id, contactE.id)}`);
  console.log(`  Actor B - Contact F muted: ${agent.isContactMuted(actorB.id, contactF.id)}`);

  // Test 1: Mute contacts E and F for actor A
  console.log("\nMuting contacts E and F for Actor A...");
  const muteStatusA_E = agent.toggleContactMute(actorA.id, contactE.id);
  const muteStatusA_F = agent.toggleContactMute(actorA.id, contactF.id);

  console.log(`Actor A - Contact E muted: ${muteStatusA_E}`);
  console.log(`Actor A - Contact F muted: ${muteStatusA_F}`);

  // Verify that actor B's contacts are still unmuted
  console.log("\nVerifying Actor B contacts are still unmuted...");
  const muteStatusB_E = agent.isContactMuted(actorB.id, contactE.id);
  const muteStatusB_F = agent.isContactMuted(actorB.id, contactF.id);

  console.log(`Actor B - Contact E muted: ${muteStatusB_E}`);
  console.log(`Actor B - Contact F muted: ${muteStatusB_F}`);

  if (muteStatusA_E && muteStatusA_F && !muteStatusB_E && !muteStatusB_F) {
    console.log("✅ Mute settings isolation test PASSED");
  } else {
    console.log("❌ Mute settings isolation test FAILED");
  }

  // Test 2: Mute contact E for actor B
  console.log("\nMuting contact E for Actor B...");
  const muteStatusB_E_new = agent.toggleContactMute(actorB.id, contactE.id);
  console.log(`Actor B - Contact E muted: ${muteStatusB_E_new}`);

  // Verify that actor A's mute status for contact E is unchanged
  const muteStatusA_E_check = agent.isContactMuted(actorA.id, contactE.id);
  console.log(`Actor A - Contact E muted (should still be true): ${muteStatusA_E_check}`);

  if (muteStatusB_E_new && muteStatusA_E_check) {
    console.log("✅ Cross-actor mute independence test PASSED");
  } else {
    console.log("❌ Cross-actor mute independence test FAILED");
  }

  // Cleanup: Unmute all contacts
  agent.toggleContactMute(actorA.id, contactE.id);
  agent.toggleContactMute(actorA.id, contactF.id);
  agent.toggleContactMute(actorB.id, contactE.id);
}

async function testMessageHistoryIsolation(agent) {
  console.log("--- Testing Message History Isolation ---");

  // Create test actors if they don't exist
  const actorA = await createTestActor("TestActorA", "Actor A");
  const actorB = await createTestActor("TestActorB", "Actor B");
  const contactE = await createTestActor("TestContactE", "Contact E");

  // Add contact E to both actors
  agent.addContactToActor(actorA.id, contactE.id);
  agent.addContactToActor(actorB.id, contactE.id);

  // Send some test messages
  console.log("Sending test messages...");
  await agent.sendMessage(actorA.id, contactE.id, "Hello from Actor A to Contact E");
  await agent.sendMessage(contactE.id, actorA.id, "Hello from Contact E to Actor A");
  await agent.sendMessage(actorB.id, contactE.id, "Hello from Actor B to Contact E");
  await agent.sendMessage(contactE.id, actorB.id, "Hello from Contact E to Actor B");

  // Check initial message counts
  const messagesA_E = agent.getMessagesForConversation(actorA.id, contactE.id);
  const messagesB_E = agent.getMessagesForConversation(actorB.id, contactE.id);

  console.log(`Initial message counts:`);
  console.log(`  Actor A - Contact E: ${messagesA_E.length} messages`);
  console.log(`  Actor B - Contact E: ${messagesB_E.length} messages`);

  // Test: Clear conversation history for actor A
  console.log("\nClearing conversation history for Actor A...");
  const clearSuccess = await agent.clearConversationHistory(actorA.id, contactE.id);
  console.log(`Clear operation success: ${clearSuccess}`);

  // Check message counts after clearing
  const messagesA_E_after = agent.getMessagesForConversation(actorA.id, contactE.id);
  const messagesB_E_after = agent.getMessagesForConversation(actorB.id, contactE.id);

  console.log(`Message counts after clearing Actor A's history:`);
  console.log(`  Actor A - Contact E: ${messagesA_E_after.length} messages`);
  console.log(`  Actor B - Contact E: ${messagesB_E_after.length} messages`);

  if (messagesA_E_after.length === 0 && messagesB_E_after.length === messagesB_E.length) {
    console.log("✅ Message history isolation test PASSED");
  } else {
    console.log("❌ Message history isolation test FAILED");
    console.log(`Expected: Actor A = 0, Actor B = ${messagesB_E.length}`);
    console.log(`Actual: Actor A = ${messagesA_E_after.length}, Actor B = ${messagesB_E_after.length}`);
  }
}

async function createTestActor(actorId, actorName) {
  // Check if actor already exists
  let actor = game.actors.get(actorId);

  if (!actor) {
    console.log(`Creating test actor: ${actorName}`);
    try {
      actor = await Actor.create({
        name: actorName,
        type: "character",
        img: "icons/svg/mystery-man.svg"
      });
      console.log(`Created actor: ${actor.name} (${actor.id})`);
    } catch (error) {
      console.error(`Error creating actor ${actorName}:`, error);
      // Try to get existing actor with similar name
      actor = game.actors.find(a => a.name.includes(actorName.split(' ')[1]));
      if (!actor) {
        throw new Error(`Could not create or find actor ${actorName}`);
      }
    }
  } else {
    console.log(`Using existing actor: ${actor.name} (${actor.id})`);
  }

  return actor;
}

// Export the test function
window.testActorIsolation = testActorIsolation;

console.log("Actor isolation test script loaded. Run 'testActorIsolation()' to start testing."); 