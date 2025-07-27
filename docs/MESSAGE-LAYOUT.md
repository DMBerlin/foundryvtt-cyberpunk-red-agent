# Layout de Mensagens - Cyberpunk Agent

## Visão Geral

O Cyberpunk Agent foi atualizado com um layout de mensagens otimizado, removendo avatares e implementando um sistema responsivo que se adapta ao tamanho do conteúdo.

## Mudanças Implementadas

### 1. Remoção de Avatares

- **Antes**: Avatares apareciam ao lado das mensagens
- **Agora**: Layout limpo sem avatares
- **Benefício**: Mais espaço para o conteúdo da mensagem

### 2. Sistema de Tamanho Responsivo

- **Largura máxima**: 80% do espaço horizontal
- **Largura mínima**: 120px
- **Comportamento**: Se adapta ao tamanho do texto
- **Quebra de linha**: Automática para textos longos

### 3. Melhorias de Layout

- **Espaçamento**: Aumentado entre mensagens (15px)
- **Alinhamento**: Melhorado para mensagens próprias e de outros
- **Legibilidade**: Melhor contraste e espaçamento

## Implementação Técnica

### 1. CSS Responsivo

```css
.cp-message-content {
  max-width: 80%;
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 15px;
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: inline-block;
  box-sizing: border-box;
}
```

### 2. Alinhamento de Mensagens

```css
/* Mensagens próprias (alinhadas à direita) */
.cp-message-own .cp-message-content {
  margin-left: auto;
}

/* Mensagens de outros (alinhadas à esquerda) */
.cp-message-other .cp-message-content {
  margin-right: auto;
}
```

### 3. Quebra de Texto

```css
.cp-message-text {
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  white-space: pre-wrap;
}
```

## Estrutura HTML

### Antes (com avatares)
```html
<div class="cp-message other">
  <div class="cp-message-content">
    <div class="cp-message-text">Texto da mensagem</div>
    <div class="cp-message-time">12:34</div>
  </div>
  <div class="cp-message-avatar">
    <img src="avatar.jpg" alt="Nome" />
  </div>
</div>
```

### Agora (sem avatares)
```html
<div class="cp-message other">
  <div class="cp-message-content">
    <div class="cp-message-text">Texto da mensagem</div>
    <div class="cp-message-time">12:34</div>
  </div>
</div>
```

## Comportamento Responsivo

### 1. Mensagens Curtas
- **Tamanho**: Aproximadamente 120px (mínimo)
- **Comportamento**: Mantém largura mínima
- **Exemplo**: "Oi!", "Ok", "Sim"

### 2. Mensagens Médias
- **Tamanho**: 30-60% da largura disponível
- **Comportamento**: Se expande conforme necessário
- **Exemplo**: "Como você está?", "Vamos nos encontrar"

### 3. Mensagens Longas
- **Tamanho**: Até 80% da largura disponível
- **Comportamento**: Quebra linhas automaticamente
- **Exemplo**: Textos extensos, explicações detalhadas

## Vantagens do Novo Layout

### 1. **Mais Espaço**
- Sem avatares = mais espaço para texto
- Melhor aproveitamento da tela
- Layout mais limpo

### 2. **Responsividade**
- Se adapta ao conteúdo
- Funciona em diferentes tamanhos de tela
- Quebra de linha inteligente

### 3. **Legibilidade**
- Melhor espaçamento
- Contraste otimizado
- Hierarquia visual clara

### 4. **Performance**
- Menos elementos DOM
- CSS mais simples
- Renderização mais rápida

## Testes

### Função de Teste

Execute no console do navegador:

```javascript
testMessageLayout()
```

### O que Testa

1. **Mensagens curtas**: "Oi!"
2. **Mensagens médias**: Texto com tamanho intermediário
3. **Mensagens longas**: Texto extenso que quebra linhas
4. **Mensagens variadas**: Diferentes tamanhos em sequência

### Exemplo de Teste

```javascript
// Teste completo de layout
console.log("=== Teste de Layout de Mensagens ===");

// Executar teste de layout
testMessageLayout();

// Verificar resultados após 6 segundos
setTimeout(() => {
  console.log("✅ Layout test completed");
  console.log("📱 Check the chat interface for results");
}, 6000);
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

## Personalização

### 1. Ajustar Largura Máxima

```css
.cp-message-content {
  max-width: 70%; /* Reduzir para 70% */
}
```

### 2. Ajustar Largura Mínima

```css
.cp-message-content {
  min-width: 100px; /* Reduzir para 100px */
}
```

### 3. Ajustar Espaçamento

```css
.cp-message {
  margin-bottom: 20px; /* Aumentar espaçamento */
}
```

### 4. Ajustar Padding

```css
.cp-message-content {
  padding: 15px 20px; /* Aumentar padding */
}
```

## Troubleshooting

### Problemas Comuns

#### 1. Mensagens muito largas

**Sintomas:**
- Mensagens ocupam toda a largura
- Layout quebrado

**Soluções:**
1. Verificar se CSS foi carregado
2. Verificar conflitos com outros módulos
3. Usar `testMessageLayout()` para testar

#### 2. Quebra de linha não funciona

**Sintomas:**
- Texto longo não quebra
- Mensagem sai da tela

**Soluções:**
1. Verificar propriedades CSS de quebra de linha
2. Recarregar a página
3. Verificar conflitos de CSS

#### 3. Alinhamento incorreto

**Sintomas:**
- Mensagens próprias não alinhadas à direita
- Mensagens de outros não alinhadas à esquerda

**Soluções:**
1. Verificar classes CSS
2. Verificar estrutura HTML
3. Usar `testMessageLayout()` para testar

### Logs de Debug

```javascript
// Verificar layout das mensagens
const messages = document.querySelectorAll('.cp-message-content');
console.log("Message elements:", messages.length);

// Verificar larguras
messages.forEach((msg, index) => {
  const width = msg.offsetWidth;
  const maxWidth = msg.style.maxWidth;
  console.log(`Message ${index + 1}: ${width}px (max: ${maxWidth})`);
});
```

## Desenvolvimento

### Estrutura de Arquivos

```
templates/
└── chat-conversation.html    # Template sem avatares

styles/
└── module.css               # CSS responsivo
```

### CSS Principal

```css
/* Container da mensagem */
.cp-message {
  display: flex;
  margin-bottom: 15px;
  width: 100%;
}

/* Conteúdo da mensagem */
.cp-message-content {
  max-width: 80%;
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 15px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: inline-block;
  box-sizing: border-box;
}
```

### Extensibilidade

Para adicionar novos elementos ao layout:

1. **Novos indicadores**: Adicione dentro de `.cp-message-content`
2. **Novos estilos**: Crie classes CSS específicas
3. **Novos comportamentos**: Modifique as propriedades responsivas
4. **Novos elementos**: Adicione ao template HTML

## Suporte

Para problemas ou dúvidas:

1. Verifique esta documentação
2. Execute `testMessageLayout()` para testar
3. Verifique logs do console
4. Teste com diferentes tamanhos de texto
5. Abra uma issue no GitHub 