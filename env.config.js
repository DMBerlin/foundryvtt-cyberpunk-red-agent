/**
 * Environment Configuration for Cyberpunk Agent Development
 * This file contains all the paths and settings for development
 */

const path = require('path');

const envConfig = {
  // FoundryVTT Paths
  foundry: {
    username: 'danie',
    basePath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT',
    version: 'V11',
    modulesPath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V11\\Data\\modules',
    modulePath: 'C:\\Users\\danie\\AppData\\Local\\FoundryVTT\\V11\\Data\\modules\\cyberpunk-agent'
  },

  // Project Paths
  project: {
    root: 'C:\\Users\\danie\\Documents\\.code\\Projects\\Personal\\foundryvtt-modules\\cyberpunk-agent',
    name: 'cyberpunk-agent'
  },

  // Development Settings
  development: {
    mode: true,
    debug: true,
    autoRefresh: true
  },

  // Helper functions
  getFoundryModulesPath() {
    return this.foundry.modulesPath;
  },

  getFoundryModulePath() {
    return this.foundry.modulePath;
  },

  getProjectPath() {
    return this.project.root;
  },

  getModuleName() {
    return this.project.name;
  }
};

module.exports = envConfig; 