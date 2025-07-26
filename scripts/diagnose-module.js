/**
 * Module Diagnosis Script
 * This script helps diagnose why the module is not appearing in FoundryVTT
 */

const fs = require('fs');
const path = require('path');

class ModuleDiagnostic {
  constructor() {
    this.foundryPath = 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V11\\Data\\modules\\cyberpunk-agent';
    this.moduleJsonPath = path.join(this.foundryPath, 'module.json');
  }

  /**
   * Check if module directory exists
   */
  checkModuleDirectory() {
    console.log('🔍 Checking module directory...');

    if (fs.existsSync(this.foundryPath)) {
      console.log('✅ Module directory exists:', this.foundryPath);
      return true;
    } else {
      console.error('❌ Module directory not found:', this.foundryPath);
      return false;
    }
  }

  /**
   * Check if module.json exists
   */
  checkModuleJson() {
    console.log('\n📄 Checking module.json...');

    if (fs.existsSync(this.moduleJsonPath)) {
      console.log('✅ module.json exists');
      return true;
    } else {
      console.error('❌ module.json not found');
      return false;
    }
  }

  /**
   * Validate module.json syntax
   */
  validateModuleJson() {
    console.log('\n🔧 Validating module.json syntax...');

    try {
      const content = fs.readFileSync(this.moduleJsonPath, 'utf8');
      const moduleJson = JSON.parse(content);

      console.log('✅ module.json is valid JSON');

      // Check required fields
      const requiredFields = ['title', 'description', 'version', 'authors', 'id', 'esmodules'];
      const missingFields = requiredFields.filter(field => !moduleJson[field]);

      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
      } else {
        console.error('❌ Missing required fields:', missingFields);
      }

      return moduleJson;
    } catch (error) {
      console.error('❌ module.json syntax error:', error.message);
      return null;
    }
  }

  /**
   * Check if referenced files exist
   */
  checkReferencedFiles(moduleJson) {
    console.log('\n📁 Checking referenced files...');

    if (!moduleJson) return;

    // Check esmodules
    if (moduleJson.esmodules) {
      console.log('Checking esmodules:');
      moduleJson.esmodules.forEach(file => {
        const filePath = path.join(this.foundryPath, file);
        if (fs.existsSync(filePath)) {
          console.log(`  ✅ ${file}`);
        } else {
          console.error(`  ❌ ${file} - NOT FOUND`);
        }
      });
    }

    // Check styles
    if (moduleJson.styles) {
      console.log('\nChecking styles:');
      moduleJson.styles.forEach(file => {
        const filePath = path.join(this.foundryPath, file);
        if (fs.existsSync(filePath)) {
          console.log(`  ✅ ${file}`);
        } else {
          console.error(`  ❌ ${file} - NOT FOUND`);
        }
      });
    }

    // Check languages
    if (moduleJson.languages) {
      console.log('\nChecking languages:');
      moduleJson.languages.forEach(lang => {
        const filePath = path.join(this.foundryPath, lang.path);
        if (fs.existsSync(filePath)) {
          console.log(`  ✅ ${lang.lang} (${lang.path})`);
        } else {
          console.error(`  ❌ ${lang.lang} (${lang.path}) - NOT FOUND`);
        }
      });
    }
  }

  /**
   * Check FoundryVTT modules directory
   */
  checkFoundryModulesDirectory() {
    console.log('\n🎮 Checking FoundryVTT modules directory...');

    const modulesDir = 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V11\\Data\\modules';

    if (fs.existsSync(modulesDir)) {
      console.log('✅ FoundryVTT modules directory exists');

      // List all modules
      const modules = fs.readdirSync(modulesDir);
      console.log(`📋 Found ${modules.length} modules in directory:`);

      modules.forEach(module => {
        const modulePath = path.join(modulesDir, module);
        const stats = fs.statSync(modulePath);

        if (stats.isDirectory()) {
          const moduleJsonPath = path.join(modulePath, 'module.json');
          if (fs.existsSync(moduleJsonPath)) {
            console.log(`  ✅ ${module} (has module.json)`);
          } else {
            console.log(`  ⚠️  ${module} (no module.json)`);
          }
        }
      });
    } else {
      console.error('❌ FoundryVTT modules directory not found');
    }
  }

  /**
   * Run full diagnosis
   */
  runDiagnosis() {
    console.log('🚀 Running module diagnosis...\n');

    // Check directory
    if (!this.checkModuleDirectory()) {
      return;
    }

    // Check module.json
    if (!this.checkModuleJson()) {
      return;
    }

    // Validate module.json
    const moduleJson = this.validateModuleJson();
    if (!moduleJson) {
      return;
    }

    // Check referenced files
    this.checkReferencedFiles(moduleJson);

    // Check FoundryVTT modules directory
    this.checkFoundryModulesDirectory();

    console.log('\n📝 Diagnosis complete!');
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure FoundryVTT is not running');
    console.log('2. Clear browser cache (Ctrl+Shift+R)');
    console.log('3. Restart FoundryVTT');
    console.log('4. Check browser console for errors');
    console.log('5. Verify the module appears in Add-on Modules list');
  }
}

// Run diagnosis if executed directly
if (require.main === module) {
  const diagnostic = new ModuleDiagnostic();
  diagnostic.runDiagnosis();
}

module.exports = ModuleDiagnostic; 