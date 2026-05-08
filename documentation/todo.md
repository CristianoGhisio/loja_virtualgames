# Sistema de Atendimento — Correções e Melhorias de Fluxo

## Resumo
1. Modal de interações refatorado para estilo WhatsApp (bolhas, alinhamento, scroll, polling 3s)
2. Fluxo automático de avaliação ao arrastar para última coluna (mensagem pronta + botão enviar)
3. Auto-refresh periódico dos cards (30s)
4. Docker: healthcheck + entrypoint mais resiliente

## Tarefas
Frontend; Backend; Docker

## Tarefas

### Tarefa 1 — Modal de Conversa estilo WhatsApp
- (X) Bolha cinza (cliente) à esquerda / bolha azul (atendente) à direita
- (X) Mensagens de sistema (CRM) centralizadas
- (X) Scroll automático para mensagens mais recentes
- (X) Envio por Enter + botão de envio
- (X) Animação de "digitando" no loading
- (X) Check azul nas mensagens do atendente

### Tarefa 2 — Polling em tempo real
- (X) Polling automático a cada 3s no modal de conversa
- (X) Polling para refresh de cards a cada 30s
- (X) Stop polling ao fechar modal
- (X) Notificação hasNewMessage é limpa ao abrir conversa

### Tarefa 3 — Fluxo de Feedback
- (X) Ao arrastar para última coluna: janela de confirmação com mensagem pronta
- (X) Botão "Enviar Avaliação" em destaque (verde)
- (X) Textarea editável para personalizar mensagem
- (X) Card some da última coluna quando cliente responde

### Tarefa 4 — Docker
- (X) Healthcheck HTTP no container app
- (X) Entrypoint mais resiliente (MAX_RETRIES=90, validação de migrate)
- (X) Containers reconstruídos e rodando
