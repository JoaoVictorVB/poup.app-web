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

- ✅ **Autenticação JWT** - Login seguro e persistente
- ✅ **CRUD Completo** - Criar, ler, atualizar e deletar assinaturas
- ✅ **Cálculos Automáticos** - Gastos mensais e anuais calculados automaticamente
- ✅ **Calendário Visual** - Veja seus pagamentos organizados por data
- ✅ **Estatísticas Detalhadas** - Gráficos e análises de gastos
- ✅ **Interface Responsiva** - Funciona em desktop, tablet e mobile
- ✅ **TypeScript** - 100% tipado para melhor developer experience

## 🛠️ Tecnologias

### Backend
- **Fastify** - Framework web rápido e eficiente
- **Prisma** - ORM moderno para banco de dados
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **Zod** - Validação de schemas
- **TypeScript** - Tipagem estática

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
docker-compose -f docker-compose.dev.yml up -d
npm install
npx prisma migrate dev
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

### Autenticação
- ✅ Registro de novos usuários
- ✅ Login com JWT
- ✅ Logout
- ✅ Token persistente
- ✅ Rotas protegidas

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
JWT_SECRET="poupapp-secret"
FRONTEND_URL="http://localhost:5173"
PORT=3333
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3333
```

## 📝 Licença

Este projeto está sob a licença MIT.

## 🙏 Agradecimentos

- Fastify pela excelente documentação
- Prisma pela ferramenta incrível
- React team pelo framework
- Comunidade open source

---

**Made with ❤️ and TypeScript**
