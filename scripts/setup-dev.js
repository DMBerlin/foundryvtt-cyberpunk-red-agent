/**
 * Development Setup Script for Cyberpunk Agent
 * This script helps set up the development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const envConfig = require('../env.config.js');

class DevSetup {
  constructor() {
    this.projectPath = process.cwd();
    this.foundryPath = envConfig.getFoundryModulePath();
    this.projectName = envConfig.getModuleName();
    this.foundryModulesPath = envConfig.getFoundryModulesPath();
  }

  /**
   * Check if FoundryVTT modules directory exists
   */
      checkFoundryPath() {
        if (!fs.existsSync(this.foundryModulesPath)) {
            console.error('❌ FoundryVTT modules directory not found!');
            console.log('Expected path:', this.foundryModulesPath);
            console.log('Please make sure FoundryVTT is installed and has been run at least once.');
            return false;
        }
        
        console.log('✅ FoundryVTT modules directory found:', this.foundryModulesPath);
        return true;
    }

  /**
   * Create symbolic link (Windows)
   */
  createSymbolicLink() {
    try {
      console.log('🔗 Creating symbolic link...');

      // Remove existing link if it exists
      if (fs.existsSync(this.foundryPath)) {
        console.log('Removing existing link...');
        execSync(`rmdir "${this.foundryPath}"`, { stdio: 'inherit' });
      }

      // Create symbolic link
      execSync(`mklink /D "${this.foundryPath}" "${this.projectPath}"`, { stdio: 'inherit' });

      console.log('✅ Symbolic link created successfully!');
      console.log('From:', this.projectPath);
      console.log('To:', this.foundryPath);

      return true;
    } catch (error) {
      console.error('❌ Failed to create symbolic link:', error.message);
      console.log('💡 Make sure you are running as Administrator');
      return false;
    }
  }

  /**
   * Copy files to FoundryVTT directory
   */
  copyFiles() {
    try {
      console.log('📁 Copying files to FoundryVTT...');

      // Create destination directory if it doesn't exist
      if (!fs.existsSync(this.foundryPath)) {
        fs.mkdirSync(this.foundryPath, { recursive: true });
      }

      // Copy files using PowerShell
      const copyCommand = `powershell -Command "Copy-Item -Path '${this.projectPath}\\*' -Destination '${this.foundryPath}\\' -Recurse -Force -Exclude 'node_modules','.git','cyberpunk-agent.zip'"`;
      execSync(copyCommand, { stdio: 'inherit' });

      console.log('✅ Files copied successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to copy files:', error.message);
      return false;
    }
  }

  /**
   * Check if module is properly set up
   */
  checkModuleSetup() {
    const moduleJsonPath = path.join(this.foundryPath, 'module.json');

    if (!fs.existsSync(moduleJsonPath)) {
      console.error('❌ module.json not found in FoundryVTT directory');
      return false;
    }

    try {
      const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
      console.log('✅ Module manifest found:', moduleJson.name);
      return true;
    } catch (error) {
      console.error('❌ Invalid module.json:', error.message);
      return false;
    }
  }

  /**
   * Setup development environment
   */
  setup() {
    console.log('🚀 Setting up Cyberpunk Agent development environment...\n');

    // Check FoundryVTT path
    if (!this.checkFoundryPath()) {
      return false;
    }

    console.log('📂 Project path:', this.projectPath);
    console.log('🎮 FoundryVTT path:', this.foundryPath);
    console.log('');

    // Ask user for preference
    console.log('Choose setup method:');
    console.log('1. Symbolic link (recommended - real-time updates)');
    console.log('2. Copy files (manual copy)');
    console.log('');

    // For now, try symbolic link first, fallback to copy
    console.log('🔄 Attempting symbolic link setup...');

    if (this.createSymbolicLink()) {
      if (this.checkModuleSetup()) {
        console.log('\n🎉 Development environment setup complete!');
        console.log('📝 Next steps:');
        console.log('1. Start FoundryVTT');
        console.log('2. Enable Developer Mode in Settings');
        console.log('3. Enable the Cyberpunk Agent module');
        console.log('4. Open browser console (F12) to see debug messages');
        return true;
      }
    }

    console.log('\n🔄 Falling back to file copy method...');
    if (this.copyFiles()) {
      if (this.checkModuleSetup()) {
        console.log('\n🎉 Development environment setup complete!');
        console.log('📝 Next steps:');
        console.log('1. Start FoundryVTT');
        console.log('2. Enable Developer Mode in Settings');
        console.log('3. Enable the Cyberpunk Agent module');
        console.log('4. Use "npm run dev:copy" to copy changes');
        return true;
      }
    }

    console.error('\n❌ Setup failed. Please check the errors above.');
    return false;
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  const setup = new DevSetup();
  setup.setup();
}

module.exports = DevSetup; 