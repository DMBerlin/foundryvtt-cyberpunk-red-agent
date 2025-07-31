# Cyberpunk Agent

Um módulo do FoundryVTT que adiciona um sistema de mensagens estilo cyberpunk para que os jogadores se comuniquem através dos agentes de seus personagens.

## Características

- **Sistema de Mensagens em Tempo Real**: Comunicação instantânea entre jogadores usando SocketLib
- **Interface Cyberpunk**: Design moderno e temático para o sistema de mensagens
- **Gerenciamento de Contatos**: Adicione, remova e organize seus contatos
- **Mensagens Privadas**: Opção para tornar as mensagens privadas entre participantes
- **Notificações Sonoras**: Sons de notificação para novas mensagens
- **Integração com FoundryVTT**: Sincronização com o chat do FoundryVTT
- **Sistema de Mute Isolado**: Mute contatos específicos para cada personagem independentemente
- **Histórico Isolado**: Cada personagem mantém seu próprio histórico de conversas
- **Isolamento por Actor**: Configurações e dados são isolados por personagem/actor

## Requisitos

- **FoundryVTT v11** ou superior
- **SocketLib** (obrigatório) - [Download aqui](https://github.com/farling42/foundryvtt-socketlib/releases)
- **Sistema Cyberpunk RED Core** (recomendado)

## Instalação

1. **Instale o SocketLib primeiro**:
   - Baixe o SocketLib do [GitHub](https://github.com/farling42/foundryvtt-socketlib/releases)
   - Instale o módulo no FoundryVTT

2. **Instale o Cyberpunk Agent**:
   - Baixe o módulo do [GitHub](https://github.com/dmberlin/cyberpunk-agent/releases)
   - Instale o módulo no FoundryVTT
   - Ative o módulo na sua campanha

## Uso

### Acessando o Agent

1. Clique no botão "Agent" na barra de controles do token
2. Ou use o comando `/agent` no chat

### Enviando Mensagens

1. Abra o Agent
2. Selecione um contato da sua lista
3. Digite sua mensagem
4. Pressione Enter para enviar

### Gerenciando Contatos

1. Abra o Agent
2. Clique em "Gerenciar Contatos"
3. Adicione ou remova contatos conforme necessário

### Configurações

- **Mensagens Privadas**: Torna as mensagens visíveis apenas para os participantes
- **Som de Notificação**: Ativa/desativa sons para novas mensagens

## Comunicação

Este módulo usa **exclusivamente o SocketLib** para comunicação em tempo real entre clientes. O SocketLib é obrigatório e deve ser instalado antes do Cyberpunk Agent.

### Por que apenas SocketLib?

- **Confiabilidade**: SocketLib oferece comunicação WebSocket robusta
- **Performance**: Melhor performance que métodos alternativos
- **Simplicidade**: Um único método de comunicação elimina complexidade
- **Manutenibilidade**: Código mais limpo e fácil de manter

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no [GitHub](https://github.com/dmberlin/cyberpunk-agent/issues)
- Consulte a documentação na pasta `docs/`

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Changelog

### v1.0.52
- **Sistema de Isolamento por Actor**: Implementado isolamento completo de configurações de mute e histórico de mensagens por personagem
- **Migração Automática**: Sistema automático de migração de dados existentes para o novo formato
- **Backup e Rollback**: Sistema de backup automático com capacidade de rollback
- **Testes Automatizados**: Scripts de teste para verificar o isolamento funcionando corretamente

### v1.0.6
- **REFATORAÇÃO MAJOR**: Módulo agora usa exclusivamente SocketLib para comunicação
- Removido suporte a socket nativo e chat como métodos de comunicação
- SocketLib agora é obrigatório (dependência)
- Melhorias na estabilidade e performance da comunicação
- Código simplificado e mais fácil de manter

### Versões Anteriores
- Sistema de mensagens em tempo real
- Interface cyberpunk
- Gerenciamento de contatos
- Integração com FoundryVTT
- Sistema de mute
- Contatos anônimos 