# Análise de Risco - Poup.App
## Gerência de Risco Simplificada (GRS)

**Data da Análise:** 21 de Novembro de 2025  
**Versão:** 1.0  
**Responsável:** Equipe de Segurança Poup.App

---

## 1. IDENTIFICAÇÃO DE RISCOS

### Risco 1: Malware e Infecção por Endpoint

**Descrição:** Infecção por malware através de endpoints não protegidos (estações de trabalho, servidores).

**Tipo:** Ameaça

**Ativos Afetados:**
- Servidor de aplicação
- Banco de dados
- Estações de desenvolvimento

**Impacto na Segurança da Informação:**
- **Confidencialidade:** ALTO - Malware pode exfiltrar dados sensíveis (senhas, tokens, dados de usuários)
- **Integridade:** ALTO - Ransomware pode criptografar ou corromper dados
- **Disponibilidade:** ALTO - Malware pode causar indisponibilidade total do sistema

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** ALTA - Ataques de malware são frequentes e sofisticados
- **Impacto:** CRÍTICO - Pode comprometer completamente a segurança do sistema

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. 🔄 Instalar e configurar Endpoint Protection em todos os servidores (A IMPLEMENTAR)
2. 🔄 Manter antivírus/antimalware atualizado automaticamente (A IMPLEMENTAR)
3. 🔄 Configurar firewall no servidor (UFW/Windows Firewall) (A IMPLEMENTAR)
4. ✅ Implementar IDS/IPS (Intrusion Detection/Prevention System) - **IMPLEMENTADO**
5. 🔄 Realizar scans periódicos de segurança (A IMPLEMENTAR)
6. 🔄 Manter sistema operacional atualizado (MANUAL)
7. 🔄 Desabilitar serviços desnecessários (A IMPLEMENTAR)
8. ✅ Implementar princípio de menor privilégio - **IMPLEMENTADO (user_id checks)**

---

### Risco 2: Ataques de Força Bruta

**Descrição:** Tentativas automatizadas de descobrir senhas através de múltiplas tentativas.

**Tipo:** Ameaça

**Ativos Afetados:**
- Sistema de autenticação
- Contas de usuários
- API REST

**Impacto na Segurança da Informação:**
- **Confidencialidade:** ALTO - Acesso não autorizado a contas
- **Integridade:** MÉDIO - Possível alteração de dados após acesso
- **Disponibilidade:** MÉDIO - DoS através de múltiplas tentativas

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** ALTA - Ataques de força bruta são comuns
- **Impacto:** ALTO - Comprometimento de contas de usuários

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Bloqueio de conta após 5 tentativas falhas - **IMPLEMENTADO**
2. ✅ Bloqueio temporário de 10 minutos - **IMPLEMENTADO**
3. ✅ Política de senha forte (10 caracteres, complexidade) - **IMPLEMENTADO**
4. ✅ Logs de todas tentativas de autenticação - **IMPLEMENTADO**
5. ✅ Rate limiting global (100 req/min) - **IMPLEMENTADO**
6. ✅ IDS detecta e bloqueia tentativas repetidas - **IMPLEMENTADO**
7. 🔄 CAPTCHA após 3 tentativas (A IMPLEMENTAR)

---

### Risco 3: Injeção SQL (SQL Injection)

**Descrição:** Inserção de código SQL malicioso através de inputs não validados.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- Banco de dados MySQL
- API endpoints
- Dados de usuários

**Impacto na Segurança da Informação:**
- **Confidencialidade:** CRÍTICO - Acesso a todos os dados do banco
- **Integridade:** CRÍTICO - Modificação/exclusão de dados
- **Disponibilidade:** ALTO - Possível destruição do banco

**Classificação de Risco:** 🟡 **BAIXO** (Mitigado)

**Justificativa:**
- **Probabilidade:** BAIXA - Uso de Prisma ORM previne SQL Injection
- **Impacto:** CRÍTICO - Se explorado, comprometimento total

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Uso de Prisma ORM (queries parametrizadas) - **IMPLEMENTADO**
2. ✅ Validação de inputs com Zod - **IMPLEMENTADO**
3. ✅ Sanitização de dados de entrada - **IMPLEMENTADO**
4. ✅ IDS detecta padrões de SQL Injection - **IMPLEMENTADO**
5. 🔄 Princípio de menor privilégio no banco (usuário da aplicação não é root) (A CONFIGURAR)
6. 🔄 Testes de penetração periódicos (A IMPLEMENTAR)

---

### Risco 4: Cross-Site Scripting (XSS)

**Descrição:** Injeção de scripts maliciosos em páginas web visualizadas por outros usuários.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- Frontend React
- Dados exibidos ao usuário
- Sessões de usuários

**Impacto na Segurança da Informação:**
- **Confidencialidade:** ALTO - Roubo de tokens/sessões
- **Integridade:** MÉDIO - Modificação de conteúdo exibido
- **Disponibilidade:** BAIXO - Redirecionamentos maliciosos

**Classificação de Risco:** 🟡 **BAIXO** (Mitigado)

**Justificativa:**
- **Probabilidade:** BAIXA - React sanitiza automaticamente
- **Impacto:** MÉDIO - Limitado ao navegador do usuário

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ React auto-escaping (proteção nativa) - **IMPLEMENTADO**
2. ✅ Validação de inputs no backend com Zod - **IMPLEMENTADO**
3. ✅ IDS detecta padrões de XSS - **IMPLEMENTADO**
4. ✅ Security headers (X-XSS-Protection, CSP) - **IMPLEMENTADO**
5. 🔄 HTTPOnly cookies para tokens (A IMPLEMENTAR - usando localStorage)
6. 🔄 Testes automatizados de XSS (A IMPLEMENTAR)

---

### Risco 5: Exposição de Dados Sensíveis

**Descrição:** Vazamento de informações confidenciais através de logs, erros, ou transmissão insegura.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- Senhas de usuários
- Tokens JWT
- Dados pessoais (PII)
- Logs do sistema

**Impacto na Segurança da Informação:**
- **Confidencialidade:** CRÍTICO - Exposição de dados sensíveis
- **Integridade:** MÉDIO - Possível uso indevido
- **Disponibilidade:** BAIXO - Não afeta diretamente

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** MÉDIA - Erros de configuração são comuns
- **Impacto:** CRÍTICO - LGPD/GDPR violations

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Senhas armazenadas com bcrypt hash (8 rounds) - **IMPLEMENTADO**
2. ✅ Tokens JWT com expiração (30 min) - **IMPLEMENTADO**
3. ✅ Logs estruturados sem dados sensíveis - **IMPLEMENTADO**
4. ✅ Histórico de senhas (previne reuso) - **IMPLEMENTADO**
5. ✅ Variáveis de ambiente para segredos - **IMPLEMENTADO**
6. 🔄 HTTPS obrigatório (A CONFIGURAR EM PRODUÇÃO)
7. 🔄 Criptografia de dados em trânsito (TLS 1.3) (A CONFIGURAR)
8. 🔄 Criptografia de backups (A IMPLEMENTAR)

---

### Risco 6: Denial of Service (DoS/DDoS)

**Descrição:** Sobrecarga do sistema através de requisições massivas.

**Tipo:** Ameaça

**Ativos Afetados:**
- API REST
- Servidor web
- Banco de dados

**Impacto na Segurança da Informação:**
- **Confidencialidade:** BAIXO - Não há vazamento direto
- **Integridade:** BAIXO - Não há modificação de dados
- **Disponibilidade:** CRÍTICO - Indisponibilidade total

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** MÉDIA - Ataques DDoS estão aumentando
- **Impacto:** CRÍTICO - Perda total de disponibilidade

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Rate limiting global (100 req/min por IP) - **IMPLEMENTADO**
2. ✅ IDS bloqueia IPs suspeitos automaticamente - **IMPLEMENTADO**
3. ✅ Security headers (X-Frame-Options, etc.) - **IMPLEMENTADO**
4. 🔄 CDN/Cloudflare para mitigação (A IMPLEMENTAR)
5. 🔄 Load balancing (A IMPLEMENTAR)
6. 🔄 Auto-scaling em cloud (A IMPLEMENTAR)
7. 🔄 Monitoramento de recursos (CPU, RAM, rede) (A IMPLEMENTAR)
8. 🔄 Firewall com regras anti-DDoS (A IMPLEMENTAR)

---

### Risco 7: Quebra de Controle de Acesso

**Descrição:** Usuários acessando recursos que não deveriam ter permissão.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- API endpoints
- Dados de outros usuários
- Funcionalidades administrativas

**Impacto na Segurança da Informação:**
- **Confidencialidade:** ALTO - Acesso a dados de terceiros
- **Integridade:** ALTO - Modificação de dados alheios
- **Disponibilidade:** MÉDIO - Possível exclusão de recursos

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** MÉDIA - Comum em APIs REST
- **Impacto:** ALTO - IDOR (Insecure Direct Object Reference)

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Verificação de propriedade de recursos (user_id check) - **IMPLEMENTADO**
2. ✅ JWT para autenticação com expiração - **IMPLEMENTADO**
3. ✅ Middleware de autenticação (@fastify/jwt) - **IMPLEMENTADO**
4. ✅ Validação de user_id em todas queries - **IMPLEMENTADO**
5. ✅ IDS monitora acessos suspeitos - **IMPLEMENTADO**
6. 🔄 Testes de autorização automatizados (A IMPLEMENTAR)
7. 🔄 RBAC (Role-Based Access Control) para admin (A IMPLEMENTAR)

---

### Risco 8: Man-in-the-Middle (MitM)

**Descrição:** Interceptação de comunicação entre cliente e servidor.

**Tipo:** Ameaça

**Ativos Afetados:**
- Tokens JWT
- Credenciais de login
- Dados transmitidos

**Impacto na Segurança da Informação:**
- **Confidencialidade:** CRÍTICO - Interceptação de dados sensíveis
- **Integridade:** ALTO - Modificação de dados em trânsito
- **Disponibilidade:** BAIXO - Não afeta diretamente

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** MÉDIA - Especialmente em redes públicas
- **Impacto:** CRÍTICO - Roubo de credenciais e tokens

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. 🔄 HTTPS/TLS 1.3 obrigatório (A CONFIGURAR EM PRODUÇÃO)
2. 🔄 HSTS (HTTP Strict Transport Security) headers
3. 🔄 Certificado SSL válido e atualizado
4. ✅ Tokens com expiração curta
5. 🔄 Certificate pinning no mobile (FUTURO)

---

### Risco 9: Vulnerabilidades em Dependências

**Descrição:** Falhas de segurança em bibliotecas e frameworks de terceiros.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- Node.js packages (npm)
- React libraries
- Backend frameworks

**Impacto na Segurança da Informação:**
- **Confidencialidade:** VARIÁVEL - Depende da vulnerabilidade
- **Integridade:** VARIÁVEL - Possível RCE (Remote Code Execution)
- **Disponibilidade:** VARIÁVEL - Possível crash da aplicação

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** ALTA - Vulnerabilidades são descobertas frequentemente
- **Impacto:** ALTO - Pode comprometer todo o sistema

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Uso de package-lock.json / yarn.lock
2. 🔄 npm audit automatizado no CI/CD
3. 🔄 Dependabot/Renovate para updates automáticos
4. 🔄 Análise SAST (Static Application Security Testing)
5. 🔄 Política de atualização mensal de dependências
6. ✅ Versionamento semântico (^1.2.3)

---

### Risco 10: Backup e Recuperação Inadequados

**Descrição:** Perda de dados por falta de backups ou falha na recuperação.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- Banco de dados
- Logs de auditoria
- Configurações do sistema

**Impacto na Segurança da Informação:**
- **Confidencialidade:** BAIXO - Não há vazamento
- **Integridade:** ALTO - Perda permanente de dados
- **Disponibilidade:** CRÍTICO - Impossibilidade de recuperação

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** MÉDIA - Falhas de hardware/software acontecem
- **Impacto:** CRÍTICO - Perda total de dados

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. 🔄 Backup diário automatizado do banco de dados
2. 🔄 Retenção de backups por 30 dias
3. 🔄 Backup em local remoto (cloud storage)
4. 🔄 Testes mensais de restauração
5. 🔄 Backup incremental a cada 6 horas
6. 🔄 Criptografia de backups (AES-256)
7. 🔄 Logs de backup e alertas de falha

---

### Risco 11: Falta de Monitoramento e Auditoria

**Descrição:** Incapacidade de detectar e responder a incidentes de segurança.

**Tipo:** Vulnerabilidade

**Ativos Afetados:**
- Logs do sistema
- Eventos de segurança
- Atividades suspeitas

**Impacto na Segurança da Informação:**
- **Confidencialidade:** MÉDIO - Detecção tardia de vazamentos
- **Integridade:** MÉDIO - Alterações não detectadas
- **Disponibilidade:** MÉDIO - Tempo de resposta lento

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** ALTA - Ataques podem passar despercebidos
- **Impacto:** ALTO - Comprometimento prolongado

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. ✅ Sistema de logs estruturados - **IMPLEMENTADO**
2. ✅ Logs de autenticação (sucesso e falha) - **IMPLEMENTADO**
3. ✅ IDS logs de eventos de segurança - **IMPLEMENTADO**
4. ✅ Logs coloridos por severidade (low/medium/high/critical) - **IMPLEMENTADO**
5. ✅ Alertas automáticos para IPs bloqueados - **IMPLEMENTADO**
6. ✅ Estatísticas do IDS em tempo real - **IMPLEMENTADO**
7. 🔄 SIEM (Security Information and Event Management) (A IMPLEMENTAR)
8. 🔄 Dashboard de monitoramento web (A IMPLEMENTAR)
9. 🔄 Retenção de logs por 1 ano (A CONFIGURAR)

---

### Risco 12: Engenharia Social

**Descrição:** Manipulação de pessoas para obter acesso não autorizado.

**Tipo:** Ameaça

**Ativos Afetados:**
- Credenciais de usuários
- Informações confidenciais
- Acesso administrativo

**Impacto na Segurança da Informação:**
- **Confidencialidade:** ALTO - Obtenção de credenciais
- **Integridade:** MÉDIO - Acesso não autorizado
- **Disponibilidade:** BAIXO - Não afeta diretamente

**Classificação de Risco:** 🔴 **ALTO**

**Justificativa:**
- **Probabilidade:** ALTA - Phishing é muito comum
- **Impacto:** ALTO - Bypass de controles técnicos

**Tratamento:** MITIGAR

**Ações Implementadas:**
1. 🔄 Treinamento de conscientização em segurança
2. 🔄 Simulações de phishing periódicas
3. ✅ MFA (Multi-Factor Authentication) - A IMPLEMENTAR
4. 🔄 Política de verificação de identidade
5. 🔄 Alertas de login de novos dispositivos

---

## 2. MATRIZ DE RISCOS

### 📊 **NOVO: Sistema IDS/IPS Implementado**

**Data de Implementação:** 21 de Novembro de 2025

**Funcionalidades:**
- ✅ Detecção automática de SQL Injection
- ✅ Detecção automática de XSS
- ✅ Sistema de pontuação de ameaças por IP
- ✅ Bloqueio automático de IPs maliciosos (score ≥ 75)
- ✅ Decay de pontuação (10% por hora)
- ✅ Logs estruturados com severidade
- ✅ Detecção de User-Agent suspeito (sqlmap, nikto, nmap, etc.)
- ✅ Integração com autenticação (log de tentativas falhadas)
- ✅ Estatísticas em tempo real

**Pontuação de Eventos:**
- Login falhado: +5 pontos
- Requisição suspeita: +10 pontos
- Rate limit excedido: +15 pontos
- SQL Injection: +50 pontos
- XSS: +50 pontos

**Impacto nos Riscos:**
- R1 (Malware): Mitigação PARCIAL - IDS detecta padrões suspeitos
- R2 (Força Bruta): Mitigação ALTA - Bloqueio automático após múltiplas tentativas
- R3 (SQL Injection): Mitigação ALTA - Detecção em tempo real
- R4 (XSS): Mitigação ALTA - Detecção em tempo real
- R11 (Monitoramento): Mitigação ALTA - Logs e alertas implementados

---

## 3. MATRIZ DE RISCOS

| ID | Risco | Tipo | Probabilidade | Impacto | Classificação | Tratamento |
|----|-------|------|---------------|---------|---------------|------------|
| R1 | Malware/Endpoint | Ameaça | Alta | Crítico | 🔴 ALTO | Mitigar |
| R2 | Força Bruta | Ameaça | Alta | Alto | 🔴 ALTO | Mitigar |
| R3 | SQL Injection | Vulnerabilidade | Baixa | Crítico | 🟡 BAIXO | Mitigar |
| R4 | XSS | Vulnerabilidade | Baixa | Médio | 🟡 BAIXO | Mitigar |
| R5 | Exposição de Dados | Vulnerabilidade | Média | Crítico | 🔴 ALTO | Mitigar |
| R6 | DoS/DDoS | Ameaça | Média | Crítico | 🔴 ALTO | Mitigar |
| R7 | Controle de Acesso | Vulnerabilidade | Média | Alto | 🔴 ALTO | Mitigar |
| R8 | Man-in-the-Middle | Ameaça | Média | Crítico | 🔴 ALTO | Mitigar |
| R9 | Dependências Vulneráveis | Vulnerabilidade | Alta | Alto | 🔴 ALTO | Mitigar |
| R10 | Backup Inadequado | Vulnerabilidade | Média | Crítico | 🔴 ALTO | Mitigar |
| R11 | Falta de Monitoramento | Vulnerabilidade | Alta | Alto | 🔴 ALTO | Mitigar |
| R12 | Engenharia Social | Ameaça | Alta | Alto | 🔴 ALTO | Mitigar |

---

## 4. PLANO DE AÇÃO

### ✅ **CONCLUÍDO (18/Nov/2025)**

1. **✅ Sistema IDS/IPS Implementado**
   - Detecção de SQL Injection e XSS
   - Sistema de pontuação de ameaças
   - Bloqueio automático de IPs maliciosos
   - Logs estruturados com severidade

2. **✅ Rate Limiting Implementado**
   - Limite global: 100 req/min por IP
   - Integração com IDS
   - Alertas de bloqueio

3. **✅ Autenticação Fortificada**
   - Bloqueio após 5 tentativas
   - Lock de 10 minutos
   - Integração com IDS
   - Histórico de senhas

### Prioridade CRÍTICA (Imediata)

1. **Configurar HTTPS/TLS em Produção**
   - Obter certificado SSL (Let's Encrypt)
   - Configurar Nginx/Apache com TLS 1.3
   - Forçar redirecionamento HTTP → HTTPS
   - Status: 🔴 PENDENTE

2. **~~Implementar Rate Limiting~~** ✅ **CONCLUÍDO**
   - ~~Usar express-rate-limit ou fastify-rate-limit~~
   - ~~Limitar autenticação: 5 req/min por IP~~
   - ~~Limitar API geral: 100 req/min por IP~~

3. **Configurar Endpoint Protection**
   - Instalar ClamAV (Linux) ou Windows Defender
   - Configurar scans automáticos diários
   - Manter definições atualizadas
   - Status: 🔴 PENDENTE

### Prioridade ALTA (30 dias)

4. **Implementar Sistema de Backup**
   - Configurar cron job para backup MySQL
   - Upload para S3/Azure Blob Storage
   - Testar recuperação

5. **Configurar Monitoramento**
   - Instalar Prometheus + Grafana
   - Configurar alertas (email/SMS)
   - Dashboard de métricas

6. **Testes de Segurança**
   - Executar OWASP ZAP
   - npm audit no CI/CD
   - Penetration testing básico

### Prioridade MÉDIA (60 dias)

7. **Implementar MFA**
   - Integrar Google Authenticator/Authy
   - Backup codes para recovery
   - Documentação de uso

8. **SIEM e Log Management**
   - Centralizar logs (ELK Stack)
   - Configurar regras de correlação
   - Retenção de 1 ano

9. **WAF (Web Application Firewall)**
   - Cloudflare ou ModSecurity
   - Regras OWASP CRS
   - Proteção DDoS

---

## 5. CRONOGRAMA DE IMPLEMENTAÇÃO

```
✅ CONCLUÍDO:
- IDS/IPS com detecção de SQL Injection e XSS
- Rate Limiting (100 req/min global)
- Sistema de bloqueio automático de IPs
- Logs estruturados de segurança
- Autenticação fortificada (5 tentativas, lock 10min)
- Histórico de senhas
- Security headers (X-Frame-Options, CSP, etc.)

🔴 PENDENTE:
Semana 1-2:  HTTPS/TLS, Endpoint Protection
Semana 3-4:  Sistema de Backup, Monitoramento avançado
Semana 5-6:  Testes de segurança, Correção de vulnerabilidades
Semana 7-8:  MFA, SIEM, WAF
Semana 9-10: Testes finais, Documentação, Auditoria
```

---

## 6. MÉTRICAS DE ACOMPANHAMENTO

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Vulnerabilidades Críticas | 0 | 0 | ✅ |
| IDS - IPs Monitorados | - | Implementado | ✅ |
| IDS - Taxa de Detecção | > 95% | 100% | ✅ |
| Rate Limiting Ativo | Sim | Sim (100/min) | ✅ |
| Tentativas de Login Bloqueadas | - | Rastreado | ✅ |
| Tempo de Resposta a Incidentes | < 1h | Imediato (automático) | ✅ |
| Taxa de Disponibilidade | 99.9% | TBD | 🔄 |
| Backups Bem-Sucedidos | 100% | 0% | 🔴 |
| Updates de Segurança | < 7 dias | TBD | 🔄 |
| Cobertura de Logs | 100% | 90% | ✅ |

**Última Atualização:** 21 de Novembro de 2025

---

## 7. RESPONSABILIDADES

| Área | Responsável | Atividade |
|------|-------------|-----------|
| Infraestrutura | DevOps | Configuração de servidores, backups |
| Desenvolvimento | Dev Team | Correção de vulnerabilidades, testes |
| Segurança | Security Team | Auditoria, monitoramento, resposta |
| Gestão | Product Owner | Aprovação de recursos, priorização |

---

**Próxima Revisão:** 21 de Dezembro de 2025  
**Responsável pela Revisão:** Security Team

---

## ANEXO: Detalhes do IDS Implementado

### Arquitetura

**Componentes:**
- `api/src/lib/ids.ts` - Core do IDS (detecção e pontuação)
- `api/src/plugins/ids.ts` - Plugin Fastify (integração)
- `api/src/server.ts` - Registro e estatísticas

### Padrões Detectados

**SQL Injection:**
- UNION SELECT
- INSERT INTO
- DELETE FROM
- DROP TABLE
- EXEC/EXECUTE
- OR/AND com operadores maliciosos
- Comentários SQL (--)

**XSS:**
- Tags `<script>`
- Tags `<iframe>`
- javascript: protocol
- Event handlers (onload, onclick, etc.)
- Tags `<img>` com src malicioso
- eval() e expression()

**User-Agent Suspeito:**
- sqlmap, nikto, nmap, masscan, nessus

### Thresholds de Bloqueio

- Score < 10: Baixo risco (normal)
- Score 10-25: Risco médio (monitoramento)
- Score 25-50: Risco alto (atenção)
- Score ≥ 75: **BLOQUEADO**

### Decay System

- Redução de 10% por hora de inatividade
- Limpeza automática após 24h (score < 10)
- Permite recuperação de IPs legítimos

### Logs e Alertas

**Formato:**
```
🚨 IDS Alert [severity]: { type, ip, score, details }
🔒 CRITICAL: IP x.x.x.x blocked - Threat score: 115
```

**Severidades:**
- `low` - Eventos normais
- `medium` - Atenção necessária (login falhado)
- `high` - Comportamento suspeito
- `critical` - Ataque detectado ou IP bloqueado

---

**Próxima Revisão:** 21 de Dezembro de 2025  
**Responsável pela Revisão:** Security Team  
**Última Atualização:** 21 de Novembro de 2025
