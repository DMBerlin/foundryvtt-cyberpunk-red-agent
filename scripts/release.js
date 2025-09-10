#!/usr/bin/env node

/**
 * Release Script for Cyberpunk Agent FoundryVTT Module
 * 
 * This script automates the release process:
 * 1. Bumps version in module.json and package.json
 * 2. Updates CHANGELOG.md 
 * 3. Creates git commit and tag
 * 4. Pushes to origin to trigger GitHub Actions release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const MODULE_JSON_PATH = path.join(ROOT_DIR, 'module.json');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const CHANGELOG_PATH = path.join(ROOT_DIR, 'CHANGELOG.md');

// Utility functions
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function exec(command, options = {}) {
  console.log(`> ${command}`);
  return execSync(command, { encoding: 'utf8', cwd: ROOT_DIR, ...options });
}

function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${parts[0] + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch':
    default:
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
}

function updateChangelog(newVersion) {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.log('CHANGELOG.md not found, skipping changelog update');
    return;
  }

  let changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Replace [Unreleased] with the new version
  changelog = changelog.replace(
    /## \[Unreleased\]/,
    `## [Unreleased]\n\n## [${newVersion}] - ${today}`
  );

  fs.writeFileSync(CHANGELOG_PATH, changelog);
  console.log(`Updated CHANGELOG.md with version ${newVersion}`);
}

function validateGitState() {
  try {
    // Check if we're in a git repository
    exec('git rev-parse --git-dir', { stdio: 'pipe' });

    // Check for uncommitted changes
    const status = exec('git status --porcelain', { stdio: 'pipe' });
    if (status.trim()) {
      console.error('Error: You have uncommitted changes. Please commit or stash them first.');
      console.log('Uncommitted files:');
      console.log(status);
      process.exit(1);
    }

    // Check current branch
    const branch = exec('git branch --show-current', { stdio: 'pipe' }).trim();
    if (branch !== 'develop' && branch !== 'main') {
      console.warn(`Warning: You're on branch '${branch}'. Consider releasing from 'develop' or 'main'.`);
    }

    console.log(`Git state validated. Current branch: ${branch}`);
  } catch (error) {
    console.error('Error: Not in a git repository or git command failed');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch';

  if (!['major', 'minor', 'patch'].includes(versionType)) {
    console.error('Usage: node scripts/release.js [major|minor|patch]');
    console.error('Default: patch');
    process.exit(1);
  }

  console.log('🚀 Starting release process...');

  // Validate git state
  validateGitState();

  // Read current versions
  const moduleData = readJSON(MODULE_JSON_PATH);
  const packageData = readJSON(PACKAGE_JSON_PATH);

  const currentVersion = moduleData.version;
  const newVersion = incrementVersion(currentVersion, versionType);

  console.log(`📦 Bumping version: ${currentVersion} → ${newVersion}`);

  // Update module.json
  moduleData.version = newVersion;
  writeJSON(MODULE_JSON_PATH, moduleData);
  console.log('✅ Updated module.json');

  // Update package.json
  packageData.version = newVersion;
  writeJSON(PACKAGE_JSON_PATH, packageData);
  console.log('✅ Updated package.json');

  // Update changelog
  updateChangelog(newVersion);

  // Git operations
  console.log('📝 Creating git commit and tag...');

  try {
    exec('git add module.json package.json CHANGELOG.md');
    exec(`git commit -m "Release v${newVersion}"`);
    exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

    console.log('✅ Created git commit and tag');

    // Ask for confirmation before pushing
    console.log('\n🔍 Review the changes:');
    console.log(`   Version: ${currentVersion} → ${newVersion}`);
    console.log(`   Tag: v${newVersion}`);
    console.log(`   Files updated: module.json, package.json, CHANGELOG.md`);

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nPush to origin and trigger release? (y/N): ', (answer) => {
      readline.close();

      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        try {
          exec('git push origin');
          exec(`git push origin v${newVersion}`);

          console.log('🎉 Release pushed to origin!');
          // Get repository URL from package.json
          const repoUrl = packageData.repository?.url?.replace('.git', '') || 'https://github.com/dmberlin/cyberpunk-agent';
          console.log(`🔗 GitHub Actions will create the release at: ${repoUrl}/releases`);
          console.log(`📦 Users can install using: ${repoUrl}/releases/latest/download/module.json`);
        } catch (error) {
          console.error('❌ Failed to push to origin:', error.message);
          console.log('💡 You can manually push with:');
          console.log(`   git push origin`);
          console.log(`   git push origin v${newVersion}`);
        }
      } else {
        console.log('🛑 Release cancelled. You can push manually later:');
        console.log(`   git push origin`);
        console.log(`   git push origin v${newVersion}`);
      }
    });

  } catch (error) {
    console.error('❌ Git operations failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { incrementVersion, updateChangelog };
