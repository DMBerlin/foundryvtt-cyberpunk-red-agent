# Sistema de Mute de Contatos - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora possui um sistema de mute de contatos que permite aos usuários silenciar notificações sonoras de contatos específicos, mantendo as notificações visuais ativas.

## Funcionalidade

### 1. Menu de Contexto

- **Acesso**: Clique com o botão direito em qualquer contato na lista
- **Opções disponíveis**:
  - **Mutar/Desmutar Notificações**: Alterna o status de mute do contato
  - **Informações do Contato**: Exibe detalhes do contato incluindo status de mute

### 2. Sistema de Mute

- **Comportamento**: Quando um contato está mutado, as notificações sonoras são suprimidas
- **Notificações visuais**: Continuam funcionando normalmente
- **Persistência**: O status de mute é salvo automaticamente
- **Sincronização**: Funciona em tempo real entre todos os usuários

### 3. Indicadores Visuais

- **Ícone de mute**: Aparece no avatar do contato quando mutado
- **Status "MUTADO"**: Exibido abaixo do nome do contato
- **Opacidade reduzida**: Contatos mutados aparecem com opacidade menor
- **Tooltip atualizado**: Mostra o status de mute no hover

## Implementação Técnica

### 1. Estrutura de Dados

```javascript
// Sistema de mute individual por usuário
_userMuteSettings: Map {
  "user-id": Map {
    "actorId-contactId": boolean // true = mutado, false = não mutado
  }
}

// Exemplo de armazenamento
{
  "user1": {
    "actorA-contactB": true,   // User1 mutou contato B para personagem A
    "actorA-contactC": false   // User1 não mutou contato C para personagem A
  },
  "user2": {
    "actorB-contactA": true    // User2 mutou contato A para personagem B
  }
}
```

### 2. Funções Principais

```javascript
// Toggle mute status para usuário atual
toggleContactMute(actorId, contactId) {
  // Verifica acesso ao personagem
  // Alterna status no localStorage do usuário
  // Não requer permissões de GM
}

// Verificar status de mute para usuário atual
isContactMuted(actorId, contactId) {
  // Verifica localStorage do usuário
  // Retorna true/false baseado nas preferências pessoais
}

// Get contacts com status de mute do usuário atual
getContactsForActor(actorId) {
  // Retorna contatos com isMuted baseado no usuário atual
}

// Salvar configurações do usuário
_saveUserMuteSettings(userId) {
  // Salva no localStorage (client-side)
  // Não requer permissões de servidor
}
```

### 3. Verificação de Notificações

```javascript
// Na função handleMessageUpdate
if (data.receiverId) {
  const userActors = this.getUserActors();
  const isReceiver = userActors.some(actor => actor.id === data.receiverId);
  if (isReceiver) {
    // Verificar se o sender está mutado
    const isSenderMuted = this.isContactMuted(data.receiverId, data.senderId);
    if (!isSenderMuted) {
      this.playNotificationSound(); // Tocar som apenas se não mutado
    }
  }
}
```

## Interface do Usuário

### 1. Menu de Contexto

```html
<div class="cp-context-menu">
  <button class="cp-context-menu-item" data-action="mute">
    <i class="fas fa-volume-mute"></i>
    Mutar Notificações
  </button>
  <div class="cp-context-menu-separator"></div>
  <button class="cp-context-menu-item" data-action="info">
    <i class="fas fa-info-circle"></i>
    Informações do Contato
  </button>
</div>
```

### 2. Indicadores Visuais

```html
<div class="cp-contact-item muted" data-contact-id="contact-id">
  <div class="cp-contact-avatar">
    <img src="avatar.jpg" alt="Nome" />
    <div class="cp-mute-indicator">
      <i class="fas fa-volume-mute"></i>
    </div>
  </div>
  <div class="cp-contact-info">
    <span class="cp-contact-name">Nome do Contato</span>
    <span class="cp-contact-status muted">MUTADO</span>
  </div>
</div>
```

## CSS Implementado

### 1. Menu de Contexto

```css
.cp-context-menu {
  position: fixed;
  background: var(--cp-gradient-card);
  border: 2px solid var(--cp-border);
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: var(--cp-shadow-strong);
  z-index: 10000;
  min-width: 180px;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.2s ease;
}

.cp-context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: var(--cp-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cp-context-menu-item:hover {
  background: rgba(255, 0, 51, 0.2);
  transform: translateX(5px);
}
```

### 2. Indicadores de Mute

```css
.cp-mute-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: var(--cp-error);
  border: 2px solid var(--cp-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cp-text);
  font-size: 0.7em;
}

.cp-contact-item.muted {
  opacity: 0.7;
}

.cp-contact-status.muted {
  color: var(--cp-error);
  font-style: italic;
}
```

## Como Usar

### 1. Mutar um Contato

1. Abra o Chat7 (lista de contatos)
2. Clique com o botão direito no contato desejado
3. Selecione "Mutar Notificações" (apenas para personagens que você possui)
4. Confirme a notificação de sucesso

### 2. Desmutar um Contato

1. Clique com o botão direito no contato mutado
2. Selecione "Desmutar Notificações" (apenas para personagens que você possui)
3. Confirme a notificação de sucesso

### 3. Permissões por Tipo de Usuário

#### **GMs:**
- Podem mutar/desmutar contatos de qualquer personagem
- Controle total sobre todas as configurações de mute

#### **Jogadores:**
- Podem mutar/desmutar contatos apenas de seus próprios personagens
- Visualizam status de mute de todos os contatos
- Menu mostra "(Sem Acesso)" para personagens que não possuem

### 4. Verificar Status

- **Contatos mutados**: Aparecem com ícone de mute e status "MUTADO"
- **Contatos normais**: Sem indicadores especiais
- **Tooltip**: Mostra o status atual no hover
- **Permissões**: Usuários podem modificar apenas contatos de seus próprios personagens

## Testes

### Função de Teste

Execute no console do navegador:

```javascript
testContactMute()
```

### O que Testa

1. **Toggle de mute**: Alterna o status de mute de um contato
2. **Verificação de status**: Confirma se o mute está funcionando
3. **Persistência**: Verifica se o status é salvo
4. **Sincronização**: Testa se funciona em tempo real
5. **Supressão de som**: Verifica se o som é suprimido para contatos mutados

### Exemplo de Teste

```javascript
// Teste completo do sistema de mute
console.log("=== Teste do Sistema de Mute ===");

// Executar teste
testContactMute();

// Verificar resultados após 3 segundos
setTimeout(() => {
  console.log("✅ Teste de mute concluído");
  console.log("📱 Verifique a interface para os indicadores visuais");
}, 3000);
```

## Permissões

### **Sistema de Controle de Acesso**

- **GMs**: Podem modificar status de mute de qualquer contato para qualquer personagem
- **Jogadores**: Podem modificar status de mute apenas para seus próprios personagens
- **Verificação de Acesso**: Sistema verifica se o usuário tem acesso ao personagem antes de permitir mudanças
- **Interface Adaptativa**: Menu de contexto se adapta às permissões do usuário

### **Segurança**

- **Armazenamento Local**: Configurações salvas no localStorage do navegador
- **Sem Permissões de Servidor**: Não requer permissões de GM para salvar
- **Individual por Usuário**: Cada usuário tem suas próprias preferências
- **Persistência Local**: Configurações mantidas entre sessões
- **Logs Detalhados**: Registra quem fez cada alteração para auditoria

## Vantagens

### 1. **Controle Granular**
- Mute individual por contato
- Não afeta outros contatos
- Fácil de gerenciar

### 2. **Experiência do Usuário**
- Notificações visuais mantidas
- Som suprimido apenas quando necessário
- Indicadores visuais claros

### 3. **Flexibilidade**
- Pode ser ativado/desativado a qualquer momento
- Funciona com contatos regulares e anônimos
- Persiste entre sessões

## Compatibilidade

### Sistemas Suportados

- ✅ FoundryVTT v11+
- ✅ Cyberpunk RED Core
- ✅ Todos os navegadores modernos
- ✅ Dispositivos móveis

### Módulos Testados

- ✅ Chat Portrait
- ✅ Chat Enhancements
- ✅ Better Chat
- ✅ Chat Commands

## Troubleshooting

### Problemas Comuns

#### 1. Menu de contexto não aparece

**Sintomas:**
- Clique direito não funciona
- Menu não é exibido

**Soluções:**
1. Verificar se o JavaScript foi carregado
2. Recarregar a página
3. Verificar conflitos com outros módulos

#### 2. Status de mute não persiste

**Sintomas:**
- Mute é perdido ao recarregar
- Não sincroniza entre usuários

**Soluções:**
1. Verificar se as configurações estão sendo salvas
2. Verificar permissões de GM
3. Usar `testContactMute()` para testar

#### 3. Som ainda toca para contatos mutados

**Sintomas:**
- Notificação sonora toca mesmo com mute ativo

**Soluções:**
1. Verificar se o contato está realmente mutado
2. Verificar logs do console
3. Testar com `testContactMute()`

### Logs de Debug

```javascript
// Verificar status de mute de um contato
const isMuted = window.CyberpunkAgent.instance.isContactMuted('actor-id', 'contact-id');
console.log("Contact mute status:", isMuted);

// Verificar todos os contatos com status
const contacts = window.CyberpunkAgent.instance.getContactsForActor('actor-id');
contacts.forEach(contact => {
  console.log(`${contact.name}: ${contact.isMuted ? 'MUTED' : 'UNMUTED'}`);
});
```

## Desenvolvimento

### Estrutura de Arquivos

```
scripts/
├── module.js               # Funções de mute (toggleContactMute, isContactMuted)
└── agent-home.js          # Menu de contexto e interface

styles/
└── module.css             # CSS do menu e indicadores

templates/
└── chat7.html            # Template com indicadores de mute
```

### Extensibilidade

Para adicionar novas funcionalidades:

1. **Novas opções no menu**: Adicione botões ao template do menu
2. **Novos indicadores**: Crie classes CSS específicas
3. **Novos comportamentos**: Modifique as funções de mute
4. **Novos tipos de mute**: Estenda a estrutura de dados

## Suporte

Para problemas ou dúvidas:

1. Verifique esta documentação
2. Execute `testContactMute()` para testar
3. Verifique logs do console
4. Teste com diferentes contatos
5. Abra uma issue no GitHub 