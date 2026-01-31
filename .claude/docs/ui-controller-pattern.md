# UIController Flutter-like Pattern

> Analysis of the dirty-marking reactive UI system.
> Last updated: 2026-01-31

---

## Overview

The UIController implements a Flutter-inspired **dirty-marking reactive system**:

```javascript
class UIController {
    components = new Map();        // componentId → AgentApplication
    dirtyComponents = new Set();   // componentIds needing rebuild
    updateCallbacks = new Map();   // componentId → callback
    
    markDirty(componentId) {
        this.dirtyComponents.add(componentId);
        this.scheduleUpdate();  // requestAnimationFrame
    }
    
    performUpdate() {
        componentsToUpdate.forEach(componentId => {
            updateCallback(component);
        });
    }
}
```

---

## What Works ✅

| Flutter Concept | Implementation | Status |
|-----------------|----------------|--------|
| `setState()` | `markDirty(componentId)` | ✅ Works |
| Widget tree | Component registry | ✅ Works |
| Build scheduling | `requestAnimationFrame` | ✅ Good |
| Rebuild dirty widgets | `performUpdate()` | ✅ Works |

---

## What's Broken 🔴

### The Granularity Problem

Flutter rebuilds **individual widgets**. Our callback does:

```javascript
// agent-home.js line 435
this.render(true);  // ← FULL APPLICATION RE-RENDER
```

This is like calling `runApp()` on every `setState()`.

### Consequences
- Scroll position destroyed
- Input focus lost
- Visual flicker
- Unnecessary DOM churn

---

## Fix Options

### Option A: State Preservation (Quick)

```javascript
_handleUIControllerUpdate(componentId) {
    const state = this._captureUIState();
    this.render(true);
    this._restoreUIState(state);
}

_captureUIState() {
    const container = this.element?.find('.cp-messages-container')?.[0];
    return {
        scrollTop: container?.scrollTop,
        atBottom: container?.scrollTop + container?.clientHeight >= container?.scrollHeight - 20
    };
}

_restoreUIState(state) {
    setTimeout(() => {
        const container = this.element?.find('.cp-messages-container')?.[0];
        if (container && state.atBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }, 0);
}
```

### Option B: Incremental Updates (Clean)

```javascript
_handleUIControllerUpdate(componentId, updateType) {
    switch (updateType) {
        case 'newMessage':
            this._appendNewMessages();
            break;
        case 'unreadCount':
            this._updateContactBadges();
            break;
        default:
            this.render(true);
    }
}

_appendNewMessages() {
    const currentIds = this._getRenderedMessageIds();
    const allMessages = this._getAllMessages();
    
    allMessages
        .filter(m => !currentIds.has(m.id))
        .forEach(msg => this._renderMessage(msg));
    
    this._scrollToBottom();
}
```

### Option C: Virtual DOM (Advanced)

Use morphdom or similar:

```javascript
import morphdom from 'morphdom';

async render(force, options) {
    const newHtml = await renderTemplate(this.template, this.getData());
    
    morphdom(this.element[0], newHtml, {
        onBeforeElUpdated: (from, to) => {
            if (from.classList.contains('cp-messages-container')) {
                to.scrollTop = from.scrollTop;
            }
            return true;
        }
    });
}
```

---

## Enhanced UIController

Add update types for smarter handling:

```javascript
class UIController {
    // Change Set to Map for update types
    dirtyComponents = new Map();  // componentId → updateType
    
    markDirty(componentId, updateType = 'full') {
        this.dirtyComponents.set(componentId, updateType);
        this.scheduleUpdate();
    }
    
    performUpdate() {
        this.dirtyComponents.forEach((updateType, componentId) => {
            const callback = this.updateCallbacks.get(componentId);
            callback(component, updateType);  // Pass type!
        });
    }
}

// Usage
UIController.markDirty(componentId, 'newMessage');
UIController.markDirty(componentId, 'unreadCount');
UIController.markDirty(componentId, 'full');
```

---

## Recommendation

| Timeframe | Approach | Effort |
|-----------|----------|--------|
| Immediate | Option A (state preservation) | Low |
| Next sprint | Option B (incremental) | Medium |
| Future | Option C (virtual DOM) | High |

The architecture is **sound**, just needs finer-grained updates.
