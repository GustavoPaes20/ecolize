# Ecolize

Aplicativo mobile de monitoramento de consumo de energia e água em tempo real, desenvolvido como projeto acadêmico.

O Ecolize coleta dados de sensores físicos (ESP32/ESP8266), processa essas informações em um backend Node.js e exibe ao usuário seu consumo, custos estimados e ranking de economia em um app React Native.

---

## Estrutura do repositório

```
ecolize/
  ecolize-frontend-main/   ← app mobile (Expo + React Native)
  ecolize-backend/         ← API REST (Node.js + Express)
  README.md                ← este arquivo
```

---

## Stack

### Frontend
- Expo
- React Native

### Backend
- Node.js
- Express
- MySQL (Aiven)
- JWT + bcryptjs

### Hardware
- ESP32 
- Sensores de energia e água

---

## Como rodar o projeto

### Frontend

Na pasta `ecolize-frontend-main`:

```bash
npm install
npm start
```

Comandos úteis:

```bash
npm run android
npm run ios
npm run web
```

#### Rodando com Expo

Você pode iniciar o ambiente de desenvolvimento com:

```bash
npx expo start
```

Para abrir diretamente em plataformas específicas:

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

#### Preview no celular

1. Instale o aplicativo `Expo Go`
2. Rode `npx expo start`
3. Escaneie o QR code exibido no terminal ou no navegador

Se precisar compartilhar o preview fora da sua rede local:

```bash
npx expo start --tunnel
```

---

### Backend

Na pasta `ecolize-backend`:

```bash
npm install
npm run dev
```

O servidor sobe na porta `3000`. Para verificar:

```
http://localhost:3000/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

#### Variáveis de ambiente do backend

Crie um arquivo `.env` dentro de `ecolize-backend` com:

```env
PORT=3000

DB_HOST=seu-host.aivencloud.com
DB_PORT=20150
DB_USER=avnadmin
DB_PASSWORD=sua_senha
DB_NAME=Ecolize

JWT_SECRET=uma_chave_secreta_longa_e_aleatoria
JWT_EXPIRES_IN=7d
```

> ⚠️ Nunca commite o `.env`. Solicite as credenciais ao responsável pelo banco.

---

## Estrutura do frontend

```
ecolize-frontend-main/
  src/
    components/
      auth/
      common/
      home/
      onboarding/
    config/
    context/
    hooks/
    mocks/
    navigation/
    screens/
      auth/
      home/
      onboarding/
    services/
    utils/
```

O projeto está dividido em:

- `screens` — telas do app
- `components` — componentes reutilizáveis de interface
- `services` — camada de acesso a dados e integração com a API
- `mocks` — dados simulados usados durante o desenvolvimento
- `context` — gerenciamento global de sessão e autenticação
- `hooks` — lógica reutilizável, como carregamento assíncrono

---

## Estrutura do backend

```
ecolize-backend/
  src/
    config/
      db.js
    controllers/
      authController.js
      userController.js
      goalsController.js
      devicesController.js
      readingsController.js
    middlewares/
      auth.js
    routes/
      authRoutes.js
      userRoutes.js
      goalsRoutes.js
      devicesRoutes.js
      readingsRoutes.js
  app.js
  .env
  package.json
```

---

## Rotas da API

Todas as rotas marcadas com 🔒 exigem o token JWT no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Autenticação (`/auth`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Cadastro de novo usuário | — |
| POST | `/auth/login` | Login, retorna JWT | — |
| GET | `/auth/me` | Dados do usuário logado | 🔒 |

### Usuário (`/users`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/users/profile` | Busca perfil completo | 🔒 |
| PUT | `/users/profile` | Atualiza dados do perfil | 🔒 |
| PUT | `/users/change-password` | Troca de senha | 🔒 |

### Metas (`/goals`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/goals` | Busca meta atual do usuário | 🔒 |
| POST | `/goals` | Cria ou atualiza meta de consumo | 🔒 |

### Dispositivos (`/devices`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/devices` | Registra um novo sensor | 🔒 |
| GET | `/devices` | Lista sensores do usuário | 🔒 |
| DELETE | `/devices/:id` | Remove um sensor | 🔒 |

### Leituras (`/readings`)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/readings` | Sensor envia uma leitura | 🔒 |
| GET | `/readings` | Histórico (`?tipo=ENERGIA\|AGUA&period=today\|week\|month`) | 🔒 |
| GET | `/readings/summary` | Resumo do mês com custo estimado | 🔒 |

### Ranking (`/ranking`) — em desenvolvimento

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/ranking` | Ranking do mês atual em tempo real | 🔒 |
| GET | `/ranking/history` | Histórico de rankings mensais salvos | 🔒 |

---

## Banco de dados

MySQL hospedado no Aiven. Tabelas utilizadas:

| Tabela | Descrição |
|--------|-----------|
| `USUARIO` | Dados dos usuários |
| `DISPOSITIVOS` | Sensores cadastrados |
| `LEITURA` | Leituras de consumo dos sensores |
| `CONSUMO_META` | Metas de consumo definidas pelo usuário |
| `RANKING` | Pontuações mensais salvas |

---

## Integração entre frontend e backend

O frontend já está preparado para consumir a API real. Os arquivos principais são:

- [`src/context/AuthContext.jsx`](./ecolize-frontend-main/src/context/AuthContext.jsx)
- [`src/services/apiClient.js`](./ecolize-frontend-main/src/services/apiClient.js)
- [`src/hooks/useAsyncData.js`](./ecolize-frontend-main/src/hooks/useAsyncData.js)
- [`src/config/env.js`](./ecolize-frontend-main/src/config/env.js)

Hoje o app usa dados mockados centralizados em:

- [`src/mocks/mockStore.js`](./ecolize-frontend-main/src/mocks/mockStore.js)

A substituição dos mocks por chamadas reais deve ser feita gradualmente nos arquivos de `services`, sem necessidade de refazer as telas.

### Variável de ambiente do frontend

Configure a URL da API em `src/config/env.js`:

```js
EXPO_PUBLIC_API_URL || 'http://localhost:3000'
```

> ⚠️ No celular físico ou emulador, use o IP local da máquina no lugar de `localhost`.
> Para encontrar seu IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
> Exemplo: `http://192.168.1.10:3000`

---

## Fluxos já implementados

### Frontend
- Onboarding
- Autenticação (cadastro e login)
- Home / dashboard
- Perfil e edição de dados
- Metas de consumo
- Ranking
- Detalhes de água e energia
- Configurações, FAQ, Termos de uso, Política de privacidade

### Backend
- ✅ Autenticação com JWT e criptografia de senha
- ✅ Gestão de perfil e troca de senha
- ✅ Metas de consumo (criar e atualizar)
- ✅ Registro e listagem de dispositivos/sensores
- ✅ Recebimento e consulta de leituras com filtros
- ✅ Resumo mensal com custo estimado
- 🔲 Ranking (em desenvolvimento)

---

## Observações

- O frontend ainda usa dados mockados — a integração real com a API está pendente
- O backend está funcional e testado com banco de dados real (Aiven)
- O hardware (ESP) ainda está em desenvolvimento pela equipe de hardware
- Parte dos formulários do frontend já está preparada para submit assíncrono
- Há estados básicos de `loading` e `error` nas telas principais

---

## Próximos passos

- [ ] Implementar o Módulo 4 — Ranking (backend)
- [ ] Substituir os mocks do frontend por chamadas reais à API
- [ ] Alinhar contratos de payload entre frontend e backend
- [ ] Integrar o sensor ESP ao endpoint `POST /readings`
- [ ] Adicionar persistência real de sessão/token no frontend
- [ ] Deploy do backend em servidor na nuvem (Railway ou Render)
- [ ] Build final do app com Expo

> Para instruções detalhadas de como continuar o desenvolvimento, veja o [`GUIA_EQUIPE.md`](./GUIA_EQUIPE.md).
