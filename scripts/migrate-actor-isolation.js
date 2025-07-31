/**
 * Migration Script for Actor Isolation
 * 
 * This script migrates existing mute settings and message data to the new
 * actor-isolated format. It should be run once after updating the module.
 */

console.log("=== Cyberpunk Agent | Actor Isolation Migration ===");

async function migrateActorIsolation() {
  try {
    const agent = window.CyberpunkAgent?.instance;
    if (!agent) {
      console.error("Cyberpunk Agent instance not found!");
      return;
    }

    console.log("Starting migration to actor-isolated format...");

    // Migrate mute settings
    await migrateMuteSettings(agent);

    // Migrate message data
    await migrateMessageData(agent);

    console.log("=== Migration completed successfully ===");
    ui.notifications.info("Migração para isolamento por actor concluída!");
  } catch (error) {
    console.error("Error during migration:", error);
    ui.notifications.error("Erro durante a migração: " + error.message);
  }
}

async function migrateMuteSettings(agent) {
  console.log("--- Migrating Mute Settings ---");

  const userId = game.user.id;
  const oldStorageKey = `cyberpunk-agent-mutes-${userId}`;
  const oldMuteData = localStorage.getItem(oldStorageKey);

  if (!oldMuteData) {
    console.log("No old mute settings found to migrate");
    return;
  }

  try {
    const oldMutes = JSON.parse(oldMuteData);
    console.log(`Found ${Object.keys(oldMutes).length} old mute settings to migrate`);

    // Get all actors that the current user has access to
    const userActors = agent.getUserActors();
    console.log(`User has access to ${userActors.length} actors`);

    let migratedCount = 0;
    const newMuteSettings = {};

    // For each old mute setting, create actor-specific settings
    for (const [oldKey, muteStatus] of Object.entries(oldMutes)) {
      // Old format: "actorId-contactId"
      // New format: "userId-actorId-contactId"
      const parts = oldKey.split('-');
      if (parts.length >= 2) {
        const actorId = parts[0];
        const contactId = parts.slice(1).join('-'); // In case contactId contains hyphens

        // Check if this actor is accessible to the current user
        const hasAccess = userActors.some(actor => actor.id === actorId);
        if (hasAccess) {
          const newKey = `${userId}-${actorId}-${contactId}`;
          newMuteSettings[newKey] = muteStatus;
          migratedCount++;
          console.log(`Migrated: ${oldKey} -> ${newKey} (${muteStatus ? 'muted' : 'unmuted'})`);
        } else {
          console.log(`Skipped: ${oldKey} (actor not accessible to user)`);
        }
      }
    }

    // Save new mute settings
    if (Object.keys(newMuteSettings).length > 0) {
      localStorage.setItem(oldStorageKey, JSON.stringify(newMuteSettings));
      console.log(`Successfully migrated ${migratedCount} mute settings`);
    } else {
      console.log("No mute settings to migrate");
    }

    // Backup old settings
    const backupKey = `cyberpunk-agent-mutes-${userId}-backup-${Date.now()}`;
    localStorage.setItem(backupKey, oldMuteData);
    console.log(`Backed up old settings to: ${backupKey}`);

  } catch (error) {
    console.error("Error migrating mute settings:", error);
    throw error;
  }
}

async function migrateMessageData(agent) {
  console.log("--- Migrating Message Data ---");

  const userId = game.user.id;
  const oldStorageKey = `cyberpunk-agent-messages-${userId}`;
  const oldMessageData = localStorage.getItem(oldStorageKey);

  if (!oldMessageData) {
    console.log("No old message data found to migrate");
    return;
  }

  try {
    const oldMessages = JSON.parse(oldMessageData);
    console.log(`Found ${Object.keys(oldMessages).length} old conversation keys to migrate`);

    // Get all actors that the current user has access to
    const userActors = agent.getUserActors();
    console.log(`User has access to ${userActors.length} actors`);

    // Group messages by actor
    const actorMessages = new Map();

    for (const [conversationKey, messages] of Object.entries(oldMessages)) {
      // Conversation key format: "actorId1-actorId2" (sorted)
      const parts = conversationKey.split('-');
      if (parts.length >= 2) {
        const actorId1 = parts[0];
        const actorId2 = parts.slice(1).join('-'); // In case actorId2 contains hyphens

        // Check if either actor is accessible to the current user
        const hasAccess1 = userActors.some(actor => actor.id === actorId1);
        const hasAccess2 = userActors.some(actor => actor.id === actorId2);

        if (hasAccess1) {
          if (!actorMessages.has(actorId1)) {
            actorMessages.set(actorId1, {});
          }
          actorMessages.get(actorId1)[conversationKey] = messages;
        }

        if (hasAccess2 && actorId1 !== actorId2) {
          if (!actorMessages.has(actorId2)) {
            actorMessages.set(actorId2, {});
          }
          actorMessages.get(actorId2)[conversationKey] = messages;
        }
      }
    }

    // Save actor-specific message data
    let migratedActors = 0;
    for (const [actorId, messages] of actorMessages.entries()) {
      const newStorageKey = `cyberpunk-agent-messages-${userId}-${actorId}`;
      localStorage.setItem(newStorageKey, JSON.stringify(messages));
      console.log(`Migrated messages for actor ${actorId}: ${Object.keys(messages).length} conversations`);
      migratedActors++;
    }

    console.log(`Successfully migrated messages for ${migratedActors} actors`);

    // Backup old message data
    const backupKey = `cyberpunk-agent-messages-${userId}-backup-${Date.now()}`;
    localStorage.setItem(backupKey, oldMessageData);
    console.log(`Backed up old message data to: ${backupKey}`);

  } catch (error) {
    console.error("Error migrating message data:", error);
    throw error;
  }
}

// Function to check if migration is needed
function checkMigrationNeeded() {
  const userId = game.user.id;
  const oldMuteKey = `cyberpunk-agent-mutes-${userId}`;
  const oldMessageKey = `cyberpunk-agent-messages-${userId}`;

  const hasOldMuteData = localStorage.getItem(oldMuteKey);
  const hasOldMessageData = localStorage.getItem(oldMessageKey);

  if (hasOldMuteData || hasOldMessageData) {
    console.log("Migration needed: Found old format data");
    return true;
  }

  console.log("No migration needed: No old format data found");
  return false;
}

// Function to rollback migration (if needed)
function rollbackMigration() {
  const userId = game.user.id;

  // Find backup files
  const backupKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(`cyberpunk-agent-${userId}-backup-`)) {
      backupKeys.push(key);
    }
  }

  if (backupKeys.length === 0) {
    console.log("No backup files found for rollback");
    return;
  }

  console.log(`Found ${backupKeys.length} backup files for rollback`);

  // Restore from most recent backup
  const mostRecentBackup = backupKeys.sort().pop();
  const backupData = localStorage.getItem(mostRecentBackup);

  if (backupData) {
    try {
      const data = JSON.parse(backupData);
      const originalKey = mostRecentBackup.replace(`-backup-${Date.now()}`, '');
      localStorage.setItem(originalKey, backupData);
      console.log(`Rolled back to backup: ${mostRecentBackup}`);
      ui.notifications.info("Rollback concluído!");
    } catch (error) {
      console.error("Error during rollback:", error);
      ui.notifications.error("Erro durante rollback: " + error.message);
    }
  }
}

// Export functions
window.migrateActorIsolation = migrateActorIsolation;
window.checkMigrationNeeded = checkMigrationNeeded;
window.rollbackMigration = rollbackMigration;

console.log("Actor isolation migration script loaded.");
console.log("Available functions:");
console.log("  - migrateActorIsolation() - Run the migration");
console.log("  - checkMigrationNeeded() - Check if migration is needed");
console.log("  - rollbackMigration() - Rollback to previous state (if needed)");

// Auto-check if migration is needed
if (checkMigrationNeeded()) {
  console.log("⚠️  Migration needed! Run 'migrateActorIsolation()' to migrate your data.");
  ui.notifications.warn("Migração necessária! Execute 'migrateActorIsolation()' no console para migrar seus dados.");
} 