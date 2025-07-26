/**
 * Generate npm scripts dynamically based on environment configuration
 */

const envConfig = require('../env.config.js');
const fs = require('fs');
const path = require('path');

class NpmScriptGenerator {
  constructor() {
    this.packageJsonPath = path.join(__dirname, '..', 'package.json');
  }

  /**
   * Generate npm scripts with current environment paths
   */
  generateScripts() {
    const scripts = {
      "build": "echo 'Build process not implemented yet'",
      "package": "powershell -Command \"Compress-Archive -Path .\\* -DestinationPath .\\cyberpunk-agent.zip -Force\"",
      "clean": "if exist cyberpunk-agent.zip del cyberpunk-agent.zip",
      "setup": "node scripts/setup-dev.js",
      "dev:copy": `powershell -Command "Copy-Item -Path '.\\*' -Destination '${envConfig.getFoundryModulePath()}\\' -Recurse -Force -Exclude 'node_modules','.git','cyberpunk-agent.zip'"`,
      "dev:copy-alt": `xcopy .\\* "${envConfig.getFoundryModulePath()}\\" /E /Y`,
      "dev:watch": "nodemon --watch scripts --watch styles --watch lang --watch module.json --exec \"npm run dev:copy\"",
      "test": "npm run dev:copy && echo 'Files copied to FoundryVTT. Please refresh your browser.'",
      "dev": "npm run dev:copy && echo 'Development files copied. Refresh FoundryVTT to test changes.'"
    };

    return scripts;
  }

  /**
   * Update package.json with generated scripts
   */
  updatePackageJson() {
    try {
      // Read current package.json
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));

      // Update scripts
      packageJson.scripts = this.generateScripts();

      // Write back to package.json
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));

      console.log('✅ Package.json updated with current environment paths');
      return true;
    } catch (error) {
      console.error('❌ Failed to update package.json:', error.message);
      return false;
    }
  }

  /**
   * Display current configuration
   */
  showConfig() {
    console.log('📋 Current Environment Configuration:');
    console.log('FoundryVTT Modules Path:', envConfig.getFoundryModulesPath());
    console.log('FoundryVTT Module Path:', envConfig.getFoundryModulePath());
    console.log('Project Path:', envConfig.getProjectPath());
    console.log('Module Name:', envConfig.getModuleName());
  }

  /**
   * Generate symbolic link command
   */
  generateSymbolicLinkCommand() {
    const command = `mklink /D "${envConfig.getFoundryModulePath()}" "${envConfig.getProjectPath()}"`;
    console.log('🔗 Symbolic Link Command:');
    console.log(command);
    return command;
  }
}

// Run if executed directly
if (require.main === module) {
  const generator = new NpmScriptGenerator();

  console.log('🚀 NPM Script Generator for Cyberpunk Agent\n');

  // Show current configuration
  generator.showConfig();
  console.log('');

  // Generate symbolic link command
  generator.generateSymbolicLinkCommand();
  console.log('');

  // Update package.json
  if (generator.updatePackageJson()) {
    console.log('📝 Next steps:');
    console.log('1. Run "npm run setup" to configure development environment');
    console.log('2. Or manually create symbolic link using the command above');
    console.log('3. Start FoundryVTT and enable the module');
  }
}

module.exports = NpmScriptGenerator; 