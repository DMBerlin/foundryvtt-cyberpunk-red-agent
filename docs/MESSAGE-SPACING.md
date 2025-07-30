# Espaçamento entre Mensagens - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent agora possui um sistema inteligente de espaçamento entre mensagens que agrupa visualmente mensagens do mesmo tipo, criando uma experiência de chat mais organizada e intuitiva.

## Funcionalidade

### 1. Espaçamento Reduzido entre Mensagens do Mesmo Tipo

- **Mensagens consecutivas enviadas**: Espaçamento reduzido (4px)
- **Mensagens consecutivas recebidas**: Espaçamento reduzido (4px)
- **Efeito visual**: Cria blocos visuais de mensagens relacionadas

### 2. Espaçamento Normal entre Tipos Diferentes

- **Mudança de enviado para recebido**: Espaçamento normal (12px)
- **Mudança de recebido para enviado**: Espaçamento normal (12px)
- **Efeito visual**: Separa claramente as trocas de conversa

## Implementação Técnica

### CSS Responsivo

```css
/* Reduced spacing between messages of the same type */
.cp-message + .cp-message.own {
  margin-top: 4px;
}

.cp-message + .cp-message.other {
  margin-top: 4px;
}

/* Maintain normal spacing when message types change */
.cp-message.own + .cp-message.other {
  margin-top: 12px;
}

.cp-message.other + .cp-message.own {
  margin-top: 12px;
}
```

### Comportamento

1. **Seletores CSS**: Usa seletores de irmãos adjacentes (`+`)
2. **Detecção automática**: Identifica automaticamente mensagens consecutivas
3. **Aplicação condicional**: Aplica espaçamento baseado no tipo da mensagem anterior

## Exemplo Visual

```
[Minha mensagem 1]     ← Espaçamento normal (12px)
[Minha mensagem 2]     ← Espaçamento reduzido (4px)
[Minha mensagem 3]     ← Espaçamento reduzido (4px)

[Resposta dele]        ← Espaçamento normal (12px)
[Outra resposta]       ← Espaçamento reduzido (4px)

[Minha resposta]       ← Espaçamento normal (12px)
[Minha continuação]    ← Espaçamento reduzido (4px)
```

## Vantagens

### 1. **Organização Visual**
- Agrupa mensagens relacionadas
- Facilita a leitura da conversa
- Identifica rapidamente trocas de turno

### 2. **Experiência do Usuário**
- Interface mais limpa
- Conversas mais fáceis de seguir
- Reduz confusão visual

### 3. **Compatibilidade**
- Funciona com todos os tipos de mensagem
- Compatível com mensagens privadas e públicas
- Não interfere com outras funcionalidades

## Testes

### Função de Teste Específica

Execute no console do navegador:

```javascript
testMessageSpacing()
```

### O que Testa

1. **Sequência de mensagens**: own-own-other-other-own-other-own-own-other
2. **Espaçamento reduzido**: Entre mensagens consecutivas do mesmo tipo
3. **Espaçamento normal**: Entre mensagens de tipos diferentes
4. **Visualização**: Verifica se os blocos estão sendo formados corretamente

### Exemplo de Teste

```javascript
// Teste completo de espaçamento
console.log("=== Teste de Espaçamento entre Mensagens ===");

// Executar teste de espaçamento
testMessageSpacing();

// Verificar resultados após 8 segundos
setTimeout(() => {
  console.log("✅ Teste de espaçamento concluído");
  console.log("📱 Verifique a interface de chat para os resultados");
}, 8000);
```

## Personalização

### 1. Ajustar Espaçamento Reduzido

```css
.cp-message + .cp-message.own {
  margin-top: 2px; /* Reduzir para 2px */
}

.cp-message + .cp-message.other {
  margin-top: 2px; /* Reduzir para 2px */
}
```

### 2. Ajustar Espaçamento Normal

```css
.cp-message.own + .cp-message.other {
  margin-top: 15px; /* Aumentar para 15px */
}

.cp-message.other + .cp-message.own {
  margin-top: 15px; /* Aumentar para 15px */
}
```

### 3. Desabilitar Funcionalidade

```css
/* Comentar ou remover estas regras para desabilitar */
/*
.cp-message + .cp-message.own {
  margin-top: 4px;
}

.cp-message + .cp-message.other {
  margin-top: 4px;
}

.cp-message.own + .cp-message.other {
  margin-top: 12px;
}

.cp-message.other + .cp-message.own {
  margin-top: 12px;
}
*/
```

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

#### 1. Espaçamento não funciona

**Sintomas:**
- Todas as mensagens têm o mesmo espaçamento
- Não há diferenciação visual

**Soluções:**
1. Verificar se CSS foi carregado
2. Verificar conflitos com outros módulos
3. Usar `testMessageSpacing()` para testar
4. Recarregar a página

#### 2. Espaçamento muito pequeno/grande

**Sintomas:**
- Mensagens muito próximas ou muito separadas
- Layout visualmente desagradável

**Soluções:**
1. Ajustar valores CSS conforme necessário
2. Personalizar espaçamentos
3. Testar com diferentes tamanhos de tela

#### 3. Conflitos com outros módulos

**Sintomas:**
- Comportamento inesperado
- CSS sendo sobrescrito

**Soluções:**
1. Verificar ordem de carregamento dos módulos
2. Usar `!important` se necessário
3. Testar com módulos desabilitados

### Logs de Debug

```javascript
// Verificar se as regras CSS estão sendo aplicadas
const messages = document.querySelectorAll('.cp-message');
console.log("Message elements:", messages.length);

// Verificar espaçamentos
messages.forEach((msg, index) => {
  if (index > 0) {
    const prevMsg = messages[index - 1];
    const currentType = msg.classList.contains('own') ? 'own' : 'other';
    const prevType = prevMsg.classList.contains('own') ? 'own' : 'other';
    
    console.log(`Message ${index}: ${currentType} (prev: ${prevType})`);
  }
});
```

## Desenvolvimento

### Estrutura de Arquivos

```
styles/
└── module.css               # CSS com regras de espaçamento

scripts/
└── module.js               # Função de teste testMessageSpacing()
```

### CSS Principal

```css
/* Container da lista de mensagens */
.cp-messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Espaçamento base */
  min-height: 100%;
  padding-bottom: 20px;
  position: relative;
  z-index: 2;
}

/* Regras de espaçamento inteligente */
.cp-message + .cp-message.own {
  margin-top: 4px; /* Espaçamento reduzido para mensagens próprias consecutivas */
}

.cp-message + .cp-message.other {
  margin-top: 4px; /* Espaçamento reduzido para mensagens de outros consecutivas */
}

.cp-message.own + .cp-message.other {
  margin-top: 12px; /* Espaçamento normal quando muda de próprio para outro */
}

.cp-message.other + .cp-message.own {
  margin-top: 12px; /* Espaçamento normal quando muda de outro para próprio */
}
```

### Extensibilidade

Para adicionar novos tipos de mensagem:

1. **Novos tipos**: Adicione classes CSS específicas
2. **Novos espaçamentos**: Crie regras para os novos tipos
3. **Novos comportamentos**: Modifique as regras de espaçamento
4. **Novos elementos**: Adicione ao template HTML

## Suporte

Para problemas ou dúvidas:

1. Verifique esta documentação
2. Execute `testMessageSpacing()` para testar
3. Verifique logs do console
4. Teste com diferentes sequências de mensagens
5. Abra uma issue no GitHub 