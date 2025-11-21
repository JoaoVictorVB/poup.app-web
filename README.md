# 💰 PoupApp - Gerenciador de Assinaturas

![Status](https://img.shields.io/badge/Status-Ready-success)
![API](https://img.shields.io/badge/API-Fastify-blue)
![Frontend](https://img.shields.io/badge/Frontend-React-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

> Uma aplicação fullstack completa para gerenciar suas assinaturas e controlar gastos mensais/anuais.

## 🎯 Sobre o Projeto

PoupApp é uma aplicação web que ajuda você a:
- 💳 Gerenciar todas as suas assinaturas em um só lugar
- 📊 Visualizar estatísticas de gastos mensais e anuais
- 📅 Acompanhar próximos pagamentos em um calendário
- 🔍 Pesquisar e filtrar assinaturas rapidamente
- 📈 Analisar distribuição de gastos com gráficos

## ✨ Características

- ✅ **Autenticação JWT** - Login seguro e persistente com tokens de 30 minutos
- ✅ **CRUD Completo** - Criar, ler, atualizar e deletar assinaturas
- ✅ **Cálculos Automáticos** - Gastos mensais e anuais calculados automaticamente
- ✅ **Calendário Visual** - Veja seus pagamentos organizados por data
- ✅ **Estatísticas Detalhadas** - Gráficos e análises de gastos
- ✅ **Interface Responsiva** - Funciona em desktop, tablet e mobile
- ✅ **TypeScript** - 100% tipado para melhor developer experience
- ✅ **Segurança Avançada** - Rate limiting, bcrypt, proteção contra ataques
- ✅ **Gerenciamento de Perfil** - Atualizar dados e trocar senha
- ✅ **Logging Completo** - Rastreamento de todas as operações

## 🛠️ Tecnologias

### Backend
- **Fastify 4.x** - Framework web rápido e eficiente
- **Prisma 5.x** - ORM moderno para banco de dados
- **MySQL 8.0** - Banco de dados relacional
- **@fastify/jwt** - Autenticação JWT segura
- **bcryptjs** - Hash de senhas com salt
- **@fastify/rate-limit** - Proteção contra brute force
- **Zod** - Validação de schemas
- **TypeScript 5.x** - Tipagem estática

### Frontend
- **React 19** - Biblioteca UI moderna
- **TypeScript** - Type safety
- **Vite** - Build tool ultrarrápida
- **Tailwind CSS** - Estilização utilitária
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+
- Docker Desktop
- npm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd poup.app-web

# 2. Configure e inicie a API
cd api
cp .env.example .env
# Edite o .env com suas configurações
docker-compose -f docker-compose.local.dev.yml up -d
npm install
npx prisma migrate deploy
npm run dev

# 3. Configure e inicie o Frontend (novo terminal)
cd poup.app
cp .env.example .env
npm install
npm run dev
```

**Acesse:** http://localhost:5173

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/667eea/ffffff?text=Dashboard+com+Assinaturas)

### Estatísticas
![Estatísticas](https://via.placeholder.com/800x450/764ba2/ffffff?text=Estatísticas+e+Gráficos)

### Calendário
![Calendário](https://via.placeholder.com/800x450/f093fb/ffffff?text=Calendário+de+Pagamentos)

## 📱 Funcionalidades

### Autenticação e Usuários
- ✅ Registro de novos usuários com validação
- ✅ Login com JWT (30 min de validade)
- ✅ Logout
- ✅ Token persistente no localStorage
- ✅ Rotas protegidas com middleware
- ✅ Perfil do usuário (GET /me)
- ✅ Atualizar dados do perfil (PUT /me)
- ✅ Trocar senha com validação (PUT /me/password)
- ✅ Deletar conta (DELETE /me)
- ✅ Rate limiting anti-bruteforce (5 tentativas/min)

### Assinaturas
- ✅ Listar todas as assinaturas
- ✅ Criar nova assinatura
- ✅ Editar assinatura
- ✅ Deletar assinatura
- ✅ Pesquisar assinaturas
- ✅ Filtrar por ciclo de pagamento

### Estatísticas
- ✅ Total de assinaturas ativas
- ✅ Gasto mensal total
- ✅ Gasto anual projetado
- ✅ Próximos pagamentos (30 dias)
- ✅ Gráfico de quantidade por ciclo
- ✅ Gráfico de custos por ciclo

### Calendário
- ✅ Visualização mensal
- ✅ Pagamentos por dia
- ✅ Total de gastos por dia
- ✅ Navegação entre meses
- ✅ Highlight do dia atual

## 🔒 Variáveis de Ambiente

### API (.env)
```bash
DATABASE_URL="mysql://root:dev@localhost:9003/poup"
JWT_SECRET="seu-secret-super-seguro-aqui"
FRONTEND_URL="http://localhost:5173"
PORT=3333
NODE_ENV="development"
```

**⚠️ IMPORTANTE:** Altere o `JWT_SECRET` para um valor aleatório e seguro em produção!

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3333
```

## 🔐 Segurança

Este projeto implementa diversas práticas de segurança:

- **Bcrypt** - Senhas hash com salt automático (8 rounds)
- **JWT** - Tokens assinados com expiração de 30 minutos
- **Rate Limiting** - 100 req/min global, 5 req/min em autenticação
- **Security Headers** - HSTS, CSP, X-Frame-Options, X-XSS-Protection
- **Validação de Dados** - Zod em todas as entradas
- **CORS** - Configurado para aceitar apenas frontend autorizado
- **Password History** - Impede reutilização das últimas 3 senhas
- **Account Locking** - Bloqueio após 5 tentativas falhas (10 min)

Para mais detalhes sobre segurança, consulte:
- 📋 [**PROJECT_EVALUATION.md**](./PROJECT_EVALUATION.md) - Avaliação completa do projeto com storytelling, características, testes e vulnerabilidades
- 🛡️ [**RISK_ANALYSIS.md**](./RISK_ANALYSIS.md) - Análise de riscos e gerência de segurança

## 📝 Licença

Este projeto está sob a licença MIT.

---

**Made with ❤️ and TypeScript**
