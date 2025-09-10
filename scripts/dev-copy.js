#!/usr/bin/env node

/**
 * Development Copy Script for Cyberpunk Agent
 * 
 * This script copies the module files to your local FoundryVTT modules directory
 * for testing without exposing directory paths in the public repository.
 * 
 * Setup Options:
 * 1. Environment Variable: Set FOUNDRY_MODULES_PATH
 * 2. Local Config File: Create dev-config.json (git-ignored)
 * 3. Interactive Setup: Run with --setup flag
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env.development if it exists
const envPath = path.join(__dirname, '..', '.env.development');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) { // Don't override existing env vars
          process.env[key] = value;
        }
      }
    }
  });
  console.log('📄 Loaded environment variables from .env.development');
}

// Configuration
const CONFIG_FILE = 'dev-config.json';
const MODULE_NAME = process.env.MODULE_NAME || 'cyberpunk-agent';
const VERBOSE = process.env.DEV_VERBOSE === 'true';

// Files and directories to exclude from copying
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '__tests__',
  'package*.json',
  '.gitignore',
  '*.md',
  'dev-config.json',
  '.env*',
  '*.log'
];

/**
 * Get the FoundryVTT modules path from various sources
 */
function getFoundryPath() {
  // Method 1: Environment variable (could be from .env.development or system)
  if (process.env.FOUNDRY_MODULES_PATH) {
    const source = fs.existsSync(path.join(__dirname, '..', '.env.development')) ?
      '.env.development file' : 'environment variable';
    console.log(`📁 Using path from ${source}`);
    return process.env.FOUNDRY_MODULES_PATH;
  }

  // Method 2: Local config file
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (config.foundryModulesPath) {
        console.log('📁 Using path from dev-config.json');
        return config.foundryModulesPath;
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not read dev-config.json:', error.message);
    }
  }

  // Method 3: Common default paths (Windows)
  const commonPaths = [
    path.join(process.env.LOCALAPPDATA || '', 'FoundryVTT', 'Data', 'modules'),
    path.join(process.env.APPDATA || '', 'FoundryVTT', 'Data', 'modules'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'FoundryVTT', 'Data', 'modules')
  ];

  for (const commonPath of commonPaths) {
    if (fs.existsSync(commonPath)) {
      console.log('📁 Found FoundryVTT modules at common location:', commonPath);
      return commonPath;
    }
  }

  return null;
}

/**
 * Create a local configuration file
 */
function createConfig() {
  console.log('\n🔧 Setting up local development configuration...');
  console.log('\n💡 You have two options:');
  console.log('  1. Create .env.development file (RECOMMENDED)');
  console.log('  2. Create dev-config.json file');

  console.log('\n📄 Option 1: .env.development file');
  console.log('Copy .env.example to .env.development and edit it:');
  console.log('  cp .env.example .env.development');
  console.log('  # Then edit FOUNDRY_MODULES_PATH in .env.development');

  console.log('\n📄 Option 2: dev-config.json file');
  console.log('This will create a dev-config.json file (which is git-ignored)');
  console.log('Example paths:');
  console.log('  Windows: C:\\Users\\YourUser\\AppData\\Local\\FoundryVTT\\Data\\modules');
  console.log('  macOS: ~/Library/Application Support/FoundryVTT/Data/modules');
  console.log('  Linux: ~/.local/share/FoundryVTT/Data/modules');

  const configTemplate = {
    foundryModulesPath: "REPLACE_WITH_YOUR_FOUNDRY_MODULES_PATH",
    lastUpdated: new Date().toISOString(),
    instructions: [
      "Replace 'REPLACE_WITH_YOUR_FOUNDRY_MODULES_PATH' with your actual FoundryVTT modules directory path",
      "This file is git-ignored and safe to customize locally",
      "You can also set the FOUNDRY_MODULES_PATH environment variable instead"
    ]
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configTemplate, null, 2));
  console.log(`✅ Created ${CONFIG_FILE} - please edit it with your path`);
  return false;
}

/**
 * Copy files using the appropriate method for the platform
 */
function copyFiles(sourcePath, destPath) {
  const fullDestPath = path.join(destPath, MODULE_NAME);

  console.log(`📋 Copying from: ${sourcePath}`);
  console.log(`📋 Copying to: ${fullDestPath}`);

  if (VERBOSE) {
    console.log(`📋 Module name: ${MODULE_NAME}`);
    console.log(`📋 Exclude patterns: ${EXCLUDE_PATTERNS.join(', ')}`);
  }

  // Ensure destination directory exists
  if (!fs.existsSync(fullDestPath)) {
    fs.mkdirSync(fullDestPath, { recursive: true });
    console.log('📁 Created destination directory');
  }

  try {
    if (process.platform === 'win32') {
      // Windows: Use robocopy for efficient copying
      const excludeDirs = ['node_modules', '.git', '__tests__'];
      const excludeFiles = ['package*.json', '*.md', '.env*', '*.log', '.gitignore', 'dev-config.json'];

      const excludeDirArgs = excludeDirs.join(' ');
      const excludeFileArgs = excludeFiles.join(' ');

      const cmd = `robocopy "${sourcePath}" "${fullDestPath}" /MIR /XD ${excludeDirArgs} /XF ${excludeFileArgs} /NFL /NDL /NJH /NJS`;
      console.log('🔄 Using robocopy for efficient file synchronization...');

      if (VERBOSE) {
        console.log(`📋 Robocopy command: ${cmd}`);
      }

      try {
        execSync(cmd, { stdio: 'pipe' });
      } catch (error) {
        // Robocopy exit codes: 0-7 are success, 8+ are errors
        const exitCode = error.status || 0;
        if (exitCode > 7) {
          throw error;
        }
        // Exit codes 0-7 are success with different meanings
        if (VERBOSE) {
          const meanings = {
            0: 'No files copied',
            1: 'Files copied successfully',
            2: 'Extra files/directories detected',
            3: 'Files copied and extra files detected',
            4: 'Mismatched files/directories detected',
            5: 'Files copied and mismatched files detected',
            6: 'Extra and mismatched files detected',
            7: 'Files copied, extra and mismatched files detected'
          };
          console.log(`📋 Robocopy result: ${meanings[exitCode] || 'Success'}`);
        }
      }
    } else {
      // Unix-like systems: Use rsync if available, otherwise cp
      try {
        const excludeArgs = EXCLUDE_PATTERNS.map(p => `--exclude='${p}'`).join(' ');
        const cmd = `rsync -av --delete ${excludeArgs} "${sourcePath}/" "${fullDestPath}/"`;
        console.log('🔄 Using rsync for efficient file synchronization...');
        execSync(cmd, { stdio: 'inherit' });
      } catch {
        // Fallback to cp if rsync is not available
        console.log('🔄 Using cp for file copying...');
        execSync(`cp -r "${sourcePath}/." "${fullDestPath}/"`, { stdio: 'inherit' });

        // Manual cleanup of excluded files/dirs
        EXCLUDE_PATTERNS.forEach(pattern => {
          try {
            execSync(`rm -rf "${fullDestPath}/${pattern}"`, { stdio: 'pipe' });
          } catch {
            // Ignore errors for non-existent files
          }
        });
      }
    }

    console.log('✅ Files copied successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error copying files:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Cyberpunk Agent - Development Copy Script');
  console.log('='.repeat(50));

  // Handle setup flag
  if (process.argv.includes('--setup')) {
    createConfig();
    return;
  }

  // Get the FoundryVTT path
  const foundryPath = getFoundryPath();

  if (!foundryPath) {
    console.error('❌ Could not find FoundryVTT modules path!');
    console.log('\n💡 Solutions:');
    console.log('1. Copy .env.example to .env.development and edit it (RECOMMENDED)');
    console.log('2. Set FOUNDRY_MODULES_PATH environment variable');
    console.log('3. Run: npm run dev:copy -- --setup');
    console.log('4. Create dev-config.json manually');
    process.exit(1);
  }

  // Verify the path exists
  if (!fs.existsSync(foundryPath)) {
    console.error(`❌ FoundryVTT modules path does not exist: ${foundryPath}`);
    process.exit(1);
  }

  // Copy files
  const sourcePath = process.cwd();
  const success = copyFiles(sourcePath, foundryPath);

  if (success) {
    console.log('\n🎉 Module copied successfully!');
    console.log('📱 You can now test the Cyberpunk Agent in FoundryVTT');
    console.log('🔄 Refresh your browser to see the changes');
    console.log('\n💡 Tip: Use "npm run dev:watch" for automatic copying on file changes');
  } else {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
