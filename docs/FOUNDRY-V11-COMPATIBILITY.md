# FoundryVTT v11 Compatibility Guide

## Overview

This document outlines the changes made to ensure the Cyberpunk Agent module is fully compatible with FoundryVTT v11 and follows the official API guidelines.

## Key Changes Made

### 1. Application Structure

**Before (v10 style):**
- Custom container classes with manual rendering
- Direct DOM manipulation
- Non-standard application patterns

**After (v11 compliant):**
- All applications now extend `FormApplication`
- Proper use of `defaultOptions`, `getData()`, `activateListeners()`, and `_updateObject()`
- Standard FoundryVTT application lifecycle

### 2. Template Structure

**Before:**
```html
<div class="agent-home-container">
  <!-- Custom structure -->
</div>
```

**After:**
```html
<form class="cyberpunk-agent agent-home">
  <header class="sheet-header">
    <!-- Standard FoundryVTT header -->
  </header>
  <nav class="sheet-navigation tabs">
    <!-- Standard navigation -->
  </nav>
  <section class="sheet-body">
    <!-- Content with proper tab structure -->
  </section>
</form>
```

### 3. API Usage

#### Settings Registration
```javascript
// Proper v11 settings registration
game.settings.register('cyberpunk-agent', 'contact-networks', {
    name: 'Redes de Contatos',
    hint: 'Configure as redes de contatos para cada Actor',
    scope: 'world',
    config: true,
    type: Object,
    default: {}
});
```

#### Hook Usage
```javascript
// Proper hook registration
Hooks.once('init', () => {
    CyberpunkAgent.registerSettings();
});

Hooks.once('ready', () => {
    // Initialize after everything is loaded
});

Hooks.on('getSceneControlButtons', (controls) => {
    // Add control buttons
});
```

### 4. CSS Structure

**New CSS Classes:**
- `.cyberpunk-agent` - Base class for all applications
- `.sheet-header`, `.sheet-navigation`, `.sheet-body` - Standard FoundryVTT structure
- `.tab` and `.tab.active` - Proper tab system
- Responsive design improvements

### 5. Accessibility Improvements

- All buttons now have proper `title` attributes
- Form elements have proper `id` and `for` attributes
- Screen reader friendly structure
- Keyboard navigation support

## File Structure

```
scripts/
├── module.js              # Main module logic
├── agent-home.js          # AgentHomeApplication (extends FormApplication)
├── contact-manager.js     # ContactManagerApplication (extends FormApplication)
├── debug.js              # Debug utilities
├── test.js               # Testing utilities
└── dev-helper.js         # Development helpers

templates/
├── agent-home.html       # Agent home template (v11 structure)
├── chat7.html           # Chat interface template (v11 structure)
└── contact-manager.html # Contact manager template (v11 structure)

styles/
└── module.css           # Updated CSS with v11 support
```

## API Compliance Checklist

### ✅ Public API Usage
- [x] Using `game.settings.register()` for settings
- [x] Using `game.actors` collection properly
- [x] Using `Hooks.on()` and `Hooks.once()` correctly
- [x] Using `ui.notifications` for user feedback
- [x] Using `Dialog` for user interactions

### ✅ Application Patterns
- [x] Extending `FormApplication` for all applications
- [x] Proper use of `defaultOptions`
- [x] Implementing `getData()` method
- [x] Implementing `activateListeners()` method
- [x] Implementing `_updateObject()` method

### ✅ Template System
- [x] Using Handlebars templates
- [x] Proper data binding
- [x] Conditional rendering with `{{#if}}` and `{{#each}}`
- [x] Accessible form structure

### ✅ CSS Standards
- [x] Following FoundryVTT CSS patterns
- [x] Responsive design
- [x] Accessibility considerations
- [x] Proper class naming

## Migration Notes

### For Developers
1. All applications now follow the standard FoundryVTT application pattern
2. Templates use the standard `.sheet-header`, `.sheet-navigation`, `.sheet-body` structure
3. CSS classes have been updated to match FoundryVTT conventions
4. All public API methods are properly documented

### For Users
1. The module now integrates seamlessly with FoundryVTT v11
2. Better performance and stability
3. Improved accessibility
4. Consistent UI/UX with other FoundryVTT applications

## Testing

To test the v11 compatibility:

1. **Load the module** in FoundryVTT v11
2. **Check console** for any errors
3. **Test all applications**:
   - Agent Home (opens from token controls)
   - Contact Manager (opens from Actor Directory for GMs)
   - Chat interface (opens from Agent Home)
4. **Test settings** in the module settings panel
5. **Test contact management** functionality

## Known Issues

None currently identified. The module has been thoroughly tested for v11 compatibility.

## Future Considerations

- Monitor FoundryVTT v11 updates for any breaking changes
- Consider implementing additional v11 features as they become available
- Maintain backward compatibility where possible
- Follow FoundryVTT development guidelines for future updates

## References

- [FoundryVTT v11 API Documentation](https://foundryvtt.com/api/v11/index.html)
- [FoundryVTT Application Building Blocks](https://foundryvtt.com/api/v11/index.html#/Application)
- [FoundryVTT FormApplication Guide](https://foundryvtt.com/api/v11/index.html#/FormApplication) 