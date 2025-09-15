/**
 * Development Helper for Cyberpunk Agent
 * Provides utilities for development and debugging
 */

class CyberpunkAgentDevHelper {
  constructor() {
    this.version = "1.0.0";
    this.lastReload = Date.now();
  }

  /**
   * Force reload the FoundryVTT page
   */
  static reloadFoundry() {
    console.log("Cyberpunk Agent | Forcing FoundryVTT reload...");
    location.reload();
  }

  /**
   * Hard refresh (clear cache and reload)
   */
  static hardRefresh() {
    console.log("Cyberpunk Agent | Hard refresh (clearing cache)...");
    // Clear cache and reload
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    location.reload(true);
  }

  /**
   * Reload only the module (if possible)
   */
  static reloadModule() {
    console.log("Cyberpunk Agent | Attempting module reload...");

    // Try to disable and re-enable the module
    if (game.modules.get('cyberpunk-agent')) {
      const module = game.modules.get('cyberpunk-agent');
      if (module.active) {
        console.log("Cyberpunk Agent | Module is active, attempting to reload...");
        // This is a bit tricky in FoundryVTT, so we'll just reload the page
        this.reloadFoundry();
      }
    } else {
      console.log("Cyberpunk Agent | Module not found, reloading page...");
      this.reloadFoundry();
    }
  }

  /**
   * Check module status
   */
  static checkModuleStatus() {
    console.log("Cyberpunk Agent | Checking module status...");

    if (typeof CyberpunkAgent !== 'undefined') {
      console.log("✓ CyberpunkAgent class loaded");

      if (CyberpunkAgent.instance) {
        console.log("✓ CyberpunkAgent instance active");

        console.log("  - Agent data entries:", CyberpunkAgent.instance.agentData.size);
      } else {
        console.log("✗ CyberpunkAgent instance not found");
      }
    } else {
      console.log("✗ CyberpunkAgent class not loaded");
    }

    // Check if token tool button exists
    const tokenToolButton = document.querySelector('.cpa-control-tool[data-tool="agent"]');
    if (tokenToolButton) {
      console.log("✓ Token tool button found");
    } else {
      console.log("✗ Token tool button not found");
    }

    // Check if user is GM
    if (game.user.isGM) {
      console.log("✓ User is GM (should see control button)");
    } else {
      console.log("✓ User is Player (should see control button)");
    }

    // Check available actors using the new method
    if (CyberpunkAgent.instance) {
      const userActors = CyberpunkAgent.instance.getUserActors();
      console.log(`Available actors: ${userActors.length}`);
      userActors.forEach(actor => {
        console.log(`  - ${actor.name} (${actor.id})`);
      });
    } else {
      console.log("✗ Cannot check actors - instance not available");
    }
  }

  /**
   * Test all module components
   */
  static testAllComponents() {
    console.log("Cyberpunk Agent | Testing all components...");

    // Test main module
    this.checkModuleStatus();

    // Test applications
    if (typeof AgentHomeApplication !== 'undefined') {
      console.log("✓ AgentHomeApplication available");
    } else {
      console.log("✗ AgentHomeApplication not available");
    }

    if (typeof Chat7Application !== 'undefined') {
      console.log("✓ Chat7Application available");
    } else {
      console.log("✗ Chat7Application not available");
    }



    // Test CSS
    const styleSheets = Array.from(document.styleSheets);
    const cyberpunkStyles = styleSheets.find(sheet =>
      sheet.href && sheet.href.includes('cyberpunk-agent')
    );

    if (cyberpunkStyles) {
      console.log("✓ Cyberpunk Agent CSS loaded");
    } else {
      console.log("✗ Cyberpunk Agent CSS not found");
    }

    // Test token controls
    const tokenControls = document.querySelectorAll('.control-tool');
    console.log(`Found ${tokenControls.length} token control tools`);

    tokenControls.forEach(control => {
      const tool = control.getAttribute('data-tool');
      if (tool) {
        console.log(`  - Token tool: ${tool}`);
      }
    });

    // Test scene controls
    const sceneControls = document.querySelectorAll('.scene-control');
    console.log(`Found ${sceneControls.length} scene controls`);

    sceneControls.forEach(control => {
      const name = control.getAttribute('data-control');
      if (name) {
        console.log(`  - Scene control: ${name}`);
      }
    });
  }

  /**
   * Show development menu
   */
  static showDevMenu() {
    new Dialog({
      title: "Cyberpunk Agent - Development Tools",
      content: `
                <div style="padding: 10px;">
                    <h3>Development Options:</h3>
                    <ul>
                        <li><strong>F5</strong> - Normal reload</li>
                        <li><strong>Ctrl+F5</strong> - Hard refresh (recommended)</li>
                        <li><strong>Ctrl+Shift+R</strong> - Force reload</li>
                    </ul>
                    <hr>
                    <p><strong>Console Commands:</strong></p>
                    <ul>
                        <li><code>window.cyberpunkAgentDev.reloadFoundry()</code></li>
                        <li><code>window.cyberpunkAgentDev.hardRefresh()</code></li>
                        <li><code>window.cyberpunkAgentDev.checkModuleStatus()</code></li>
                        <li><code>window.cyberpunkAgentDev.testAllComponents()</code></li>
                    </ul>
                    <hr>
                    <p><strong>Current Status:</strong></p>
                    <ul>
                        <li>User Type: ${game.user.isGM ? 'GM' : 'Player'}</li>
                        <li>Token Tool Button: ${document.querySelector('.cpa-control-tool[data-tool="agent"]') ? 'Found' : 'Not Found'}</li>
                        <li>Module Active: ${game.modules.get('cyberpunk-agent')?.active ? 'Yes' : 'No'}</li>
                        <li>Available Actors: ${CyberpunkAgent.instance ? CyberpunkAgent.instance.getUserActors().length : 'Unknown'}</li>
                    </ul>
                </div>
            `,
      buttons: {
        reload: {
          label: "Reload Foundry",
          callback: () => this.reloadFoundry()
        },
        hardRefresh: {
          label: "Hard Refresh",
          callback: () => this.hardRefresh()
        },
        check: {
          label: "Check Status",
          callback: () => this.checkModuleStatus()
        },
        test: {
          label: "Test All",
          callback: () => this.testAllComponents()
        },
        close: {
          label: "Close"
        }
      }
    }).render(true);
  }
}

// Initialize development helper
Hooks.once('ready', () => {
  // Create global instance
  window.cyberpunkAgentDev = CyberpunkAgentDevHelper;

  // Add keyboard shortcuts for development
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+D to show dev menu
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      CyberpunkAgentDevHelper.showDevMenu();
    }

    // Ctrl+Shift+R to hard refresh
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
      event.preventDefault();
      CyberpunkAgentDevHelper.hardRefresh();
    }
  });

  console.log("Cyberpunk Agent | Development helper loaded");
  console.log("Cyberpunk Agent | Press Ctrl+Shift+D for development menu");
  console.log("Cyberpunk Agent | Press Ctrl+Shift+R for hard refresh");
});

// Export for manual use
window.CyberpunkAgentDevHelper = CyberpunkAgentDevHelper; 