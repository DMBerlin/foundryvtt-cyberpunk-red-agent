/**
 * Migration script for Cyberpunk Agent v2.0.0
 * Migrates from actor-based system to device-based system
 */

class DeviceSystemMigration {
  constructor() {
    this.migrationVersion = "2.0.0";
    this.migrationKey = `cyberpunk-agent-migration-${this.migrationVersion}`;
  }

  /**
   * Check if migration is needed
   */
  needsMigration() {
    const hasMigrated = localStorage.getItem(this.migrationKey);
    return !hasMigrated;
  }

  /**
   * Perform the migration
   */
  async performMigration() {
    console.log("Cyberpunk Agent | Starting migration to device-based system...");

    try {
      // Step 1: Discover existing agent items and create devices
      await this.migrateExistingAgents();

      // Step 2: Migrate existing data if any
      await this.migrateExistingData();

      // Step 3: Mark migration as complete
      localStorage.setItem(this.migrationKey, Date.now().toString());

      console.log("Cyberpunk Agent | Migration completed successfully!");
      ui.notifications.info("Cyberpunk Agent v2.0.0 migration completed! The new device-based system is now active.");

    } catch (error) {
      console.error("Cyberpunk Agent | Migration failed:", error);
      ui.notifications.error("Migration failed. Please check the console for details.");
    }
  }

  /**
   * Migrate existing agent items to devices
   */
  async migrateExistingAgents() {
    console.log("Cyberpunk Agent | Migrating existing agent items...");

    const actors = game.actors.filter(actor => actor.type === 'character');
    let devicesCreated = 0;

    for (const actor of actors) {
      try {
        if (!actor.items) continue;

        // Look for agent items in the actor's inventory
        const agentItems = actor.items.filter(item =>
          item.type === 'gear' &&
          item.name.toLowerCase().includes('agent')
        );

        for (const item of agentItems) {
          const deviceId = `device-${actor.id}-${item.id}`;
          const deviceName = item.name || `Agent ${item.id.slice(-4)}`;

          // Create device data
          const deviceData = {
            id: deviceId,
            ownerActorId: actor.id,
            itemId: item.id,
            deviceName: deviceName,
            contacts: [],
            settings: {
              muteAll: false,
              notificationSounds: true,
              autoOpen: false
            },
            createdAt: Date.now(),
            lastUsed: Date.now()
          };

          // Add to devices map
          if (CyberpunkAgent.instance) {
            CyberpunkAgent.instance.devices.set(deviceId, deviceData);

            // Update device mappings
            if (!CyberpunkAgent.instance.deviceMappings.has(actor.id)) {
              CyberpunkAgent.instance.deviceMappings.set(actor.id, []);
            }
            CyberpunkAgent.instance.deviceMappings.get(actor.id).push(deviceId);

            devicesCreated++;
            console.log(`Cyberpunk Agent | Created device: ${deviceName} for actor ${actor.name}`);
          }
        }
      } catch (error) {
        console.error(`Cyberpunk Agent | Error migrating agent items for actor ${actor.id}:`, error);
      }
    }

    // Save the new device data
    if (CyberpunkAgent.instance) {
      CyberpunkAgent.instance.saveDeviceData();
    }

    console.log(`Cyberpunk Agent | Migration created ${devicesCreated} devices from existing agent items`);
  }

  /**
   * Migrate existing data from old system
   */
  async migrateExistingData() {
    console.log("Cyberpunk Agent | Migrating existing data...");

    // Migrate contact networks if they exist
    try {
      const contactNetworks = game.settings.get('cyberpunk-agent', 'contact-networks') || {};

      if (Object.keys(contactNetworks).length > 0) {
        console.log("Cyberpunk Agent | Found existing contact networks, migrating...");

        // For each actor with contacts, distribute them to their devices
        for (const [actorId, contacts] of Object.entries(contactNetworks)) {
          const actorDevices = CyberpunkAgent.instance?.getDevicesForActor(actorId) || [];

          if (actorDevices.length > 0) {
            // Add contacts to the first device (primary device)
            const primaryDevice = actorDevices[0];
            primaryDevice.contacts = contacts;

            console.log(`Cyberpunk Agent | Migrated ${contacts.length} contacts to device ${primaryDevice.deviceName}`);
          }
        }

        // Save the migrated data
        if (CyberpunkAgent.instance) {
          CyberpunkAgent.instance.saveDeviceData();
        }
      }
    } catch (error) {
      console.error("Cyberpunk Agent | Error migrating contact networks:", error);
    }

    // Note: Messages are stored per-user in localStorage, so they don't need migration
    // Each user will see their own messages when they access their devices
  }

  /**
   * Show migration dialog
   */
  static async showMigrationDialog() {
    const migration = new DeviceSystemMigration();

    if (!migration.needsMigration()) {
      return; // Already migrated
    }

    const confirmed = await new Promise((resolve) => {
      new Dialog({
        title: "Cyberpunk Agent v2.0.0 Migration",
        content: `
                    <div style="margin-bottom: 1em;">
                        <p><strong>Welcome to Cyberpunk Agent v2.0.0!</strong></p>
                        <p>This version introduces a new device-based system that binds agents to actual inventory items.</p>
                        <p><strong>What's new:</strong></p>
                        <ul>
                            <li>Each Agent item in your inventory becomes a separate device</li>
                            <li>Each device has its own contacts and chat history</li>
                            <li>Players can only access their own devices</li>
                            <li>GM can access all devices via the token controls</li>
                        </ul>
                        <p><strong>Migration will:</strong></p>
                        <ul>
                            <li>Scan all character inventories for Agent items</li>
                            <li>Create device instances for each Agent found</li>
                            <li>Migrate existing contact data to the new system</li>
                            <li>Preserve all existing messages</li>
                        </ul>
                        <p style="color: #ff6b6b;"><strong>Note:</strong> This migration will clear the old data structure and create a new one. Make sure to backup your data if needed.</p>
                    </div>
                `,
        buttons: {
          migrate: {
            label: "Start Migration",
            callback: () => resolve(true)
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(false)
          }
        }
      }).render(true);
    });

    if (confirmed) {
      await migration.performMigration();
    }
  }
}

// Export for use in other scripts
window.DeviceSystemMigration = DeviceSystemMigration; 