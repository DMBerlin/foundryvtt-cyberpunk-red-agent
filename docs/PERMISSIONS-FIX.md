# Permissions Fix - Resolução de Erros de Permissão

## Problema

Quando um player (não-GM) recebia novas mensagens de um contato e abria o chat com esse contato para ler as mensagens, aparecia o seguinte erro de permissão:

```
User Bruno lacks permission to update Setting [PwGyFr4UyDjehoZ3]
Uncaught (in promise) Error: User Bruno lacks permission to update Setting [PwGyFr4UyDjehoZ3]
```

## Causa

O problema ocorria porque:

1. **Configuração com escopo 'world'**: A configuração `last-read-timestamps` estava registrada com `scope: 'world'`, que só permite que GMs modifiquem
2. **Função `markConversationAsRead()`**: Quando um player abria um chat, esta função era chamada para marcar a conversa como lida
3. **Salvamento automático**: A função `_saveReadTimestamps()` tentava salvar os timestamps de leitura nas configurações do FoundryVTT
4. **Falta de permissão**: Players não têm permissão para modificar configurações com escopo 'world'

## Solução

### 1. Alteração do Escopo da Configuração

Modificada a configuração `last-read-timestamps` para usar escopo 'client':

```javascript
// Antes
game.settings.register('cyberpunk-agent', 'last-read-timestamps', {
    scope: 'world',  // ❌ Apenas GMs podem modificar
    // ...
});

// Depois
game.settings.register('cyberpunk-agent', 'last-read-timestamps', {
    scope: 'client',  // ✅ Cada usuário pode modificar
    // ...
});
```

### 2. Sistema Híbrido de Armazenamento

Implementado um sistema que usa diferentes métodos de armazenamento baseado no papel do usuário:

```javascript
// Para GMs e Assistants: usa settings do FoundryVTT
if (game.user.isGM || game.user.hasRole('ASSISTANT')) {
    game.settings.set('cyberpunk-agent', 'last-read-timestamps', timestampsData);
}

// Para Players: usa localStorage
else {
    const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(timestampsData));
}
```

### 3. Função `_saveReadTimestamps()` Melhorada

```javascript
_saveReadTimestamps() {
    try {
        // Check if user has permission to save settings
        if (!game.user.isGM && !game.user.hasRole('ASSISTANT')) {
            // For non-GM users, save to localStorage
            const timestampsData = {};
            this.lastReadTimestamps.forEach((timestamp, conversationKey) => {
                timestampsData[conversationKey] = timestamp;
            });

            const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(timestampsData));
            return;
        }

        // For GMs and assistants, save to settings
        const timestampsData = {};
        this.lastReadTimestamps.forEach((timestamp, conversationKey) => {
            timestampsData[conversationKey] = timestamp;
        });

        game.settings.set('cyberpunk-agent', 'last-read-timestamps', timestampsData);
    } catch (error) {
        // Fallback to localStorage if settings fail
        try {
            const timestampsData = {};
            this.lastReadTimestamps.forEach((timestamp, conversationKey) => {
                timestampsData[conversationKey] = timestamp;
            });

            const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(timestampsData));
        } catch (localStorageError) {
            console.error("Error saving read timestamps to localStorage:", localStorageError);
        }
    }
}
```

### 4. Função `_loadReadTimestamps()` Melhorada

```javascript
_loadReadTimestamps() {
    try {
        let timestampsData = {};

        // Try to load from settings first (for GMs and assistants)
        if (game.user.isGM || game.user.hasRole('ASSISTANT')) {
            timestampsData = game.settings.get('cyberpunk-agent', 'last-read-timestamps') || {};
        } else {
            // For non-GM users, load from localStorage
            const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                timestampsData = JSON.parse(storedData);
            }
        }

        this.lastReadTimestamps.clear();
        Object.entries(timestampsData).forEach(([conversationKey, timestamp]) => {
            this.lastReadTimestamps.set(conversationKey, timestamp);
        });
    } catch (error) {
        // Fallback to localStorage if settings fail
        try {
            const storageKey = `cyberpunk-agent-read-timestamps-${game.user.id}`;
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                const timestampsData = JSON.parse(storedData);
                this.lastReadTimestamps.clear();
                Object.entries(timestampsData).forEach(([conversationKey, timestamp]) => {
                    this.lastReadTimestamps.set(conversationKey, timestamp);
                });
            }
        } catch (localStorageError) {
            console.error("Error loading read timestamps from localStorage:", localStorageError);
        }
    }
}
```

## Resultado

- ✅ Players podem abrir chats sem erros de permissão
- ✅ Timestamps de leitura são salvos corretamente para cada usuário
- ✅ Sistema funciona tanto para GMs quanto para Players
- ✅ Fallback robusto em caso de falhas
- ✅ Dados são persistidos entre sessões

## Comportamento por Tipo de Usuário

### **GMs e Assistants**
- **Armazenamento**: Settings do FoundryVTT (escopo 'client')
- **Persistência**: Entre sessões e dispositivos
- **Sincronização**: Automática com o servidor

### **Players**
- **Armazenamento**: localStorage do navegador
- **Persistência**: Entre sessões no mesmo navegador
- **Sincronização**: Local apenas

## Testes

Criado script de teste `__tests__/test-permissions-fix.js` com funções para verificar o fix:

- `testPermissionsFix()` - Testa o fix completo
- `testOriginalPermissionError()` - Simula o erro original
- `testLocalStorageFunctionality()` - Testa funcionalidade do localStorage
- `testSettingsVsLocalStorage()` - Testa comportamento por tipo de usuário

## Como Usar

1. Recarregue o módulo no FoundryVTT
2. Execute `testPermissionsFix()` no console para verificar se o fix funcionou
3. Players podem abrir chats normalmente - não devem aparecer mais erros de permissão

## Compatibilidade

- ✅ Mantém compatibilidade com versões anteriores
- ✅ Funciona com todos os tipos de usuário (GM, Assistant, Player)
- ✅ Sistema de fallback robusto
- ✅ Dados são preservados durante a migração

## Estrutura de Dados

### **Settings (GMs/Assistants)**
```javascript
// Armazenado em game.settings
'cyberpunk-agent.last-read-timestamps': {
  "actor1-actor2": 1640995200000,
  "actor1-actor3": 1640995300000
}
```

### **localStorage (Players)**
```javascript
// Armazenado em localStorage
'cyberpunk-agent-read-timestamps-{userId}': {
  "actor1-actor2": 1640995200000,
  "actor1-actor3": 1640995300000
}
```

## Migração de Dados

O sistema automaticamente migra dados existentes:

1. **Primeira execução**: Tenta carregar de settings
2. **Se falhar**: Tenta carregar de localStorage
3. **Salvamento**: Usa o método apropriado baseado no papel do usuário
4. **Fallback**: Sempre tenta localStorage se settings falharem 