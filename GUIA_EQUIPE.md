# Guia da Equipe — Ecolize

Este documento explica como o backend funciona, o que já foi feito, e como cada membro da equipe pode continuar o desenvolvimento. Leia do início ao fim antes de mexer no código.

---

## Como o backend funciona

O backend é um servidor HTTP feito com **Node.js + Express**. Ele recebe requisições do app mobile (frontend Expo) e do hardware (sensor ESP), processa os dados e se comunica com o banco de dados MySQL hospedado no **Aiven**.

O fluxo de qualquer requisição funciona assim:

```
App ou Sensor
    ↓ envia requisição HTTP (GET, POST, PUT, DELETE)
app.js
    ↓ direciona para a rota correta
routes/
    ↓ verifica se precisa de autenticação
middlewares/auth.js
    ↓ chama a função responsável
controllers/
    ↓ faz queries no banco
config/db.js → MySQL no Aiven
    ↓ retorna resposta JSON
App ou Sensor recebe o resultado
```

---

## O que cada arquivo faz

**`app.js`**
Ponto de entrada do servidor. Registra todas as rotas e sobe o servidor na porta definida no `.env`. É o único arquivo que você roda com `npm run dev`.

**`src/config/db.js`**
Cria e exporta um pool de conexões com o banco MySQL. Um pool mantém conexões abertas e prontas, evitando abrir e fechar conexão a cada requisição. Todos os controllers importam este arquivo.

**`src/middlewares/auth.js`**
Função que roda antes de qualquer rota protegida. Lê o token JWT do header `Authorization: Bearer TOKEN`, verifica se é válido e coloca o ID do usuário em `req.userId`. Se o token for inválido, barra a requisição com erro 401 sem nem chegar no controller.

**`src/controllers/authController.js`**
Gerencia registro, login e consulta do usuário logado. O registro criptografa a senha com bcrypt antes de salvar. O login compara a senha digitada com o hash salvo e retorna um token JWT.

**`src/controllers/userController.js`**
Gerencia atualização de perfil (nome, cidade, gênero, etc.) e troca de senha. A troca de senha exige a senha atual para confirmar a identidade antes de alterar.

**`src/controllers/goalsController.js`**
Gerencia as metas de consumo de água e energia. Usa lógica de "upsert" — se o usuário já tem uma meta, atualiza; se não tem, cria. Cada usuário tem no máximo uma linha na tabela `CONSUMO_META`.

**`src/controllers/devicesController.js`**
Gerencia os sensores físicos cadastrados. Cada sensor é vinculado a um usuário pelo `ID_USUARIO`. Quando o hardware for integrado, cada ESP vai se registrar aqui e receber um `ID` para usar nas leituras.

**`src/controllers/readingsController.js`**
O coração do sistema. Recebe as leituras dos sensores (`POST /readings`), consulta o histórico com filtros de período (`GET /readings`) e calcula o resumo mensal com custo estimado cruzando as leituras com as tarifas das metas (`GET /readings/summary`).

---

## Módulo 4 — Ranking (a ser implementado)

### Arquivos a criar

```
src/
  controllers/
    rankingController.js
  routes/
    rankingRoutes.js
```

### Como funciona o modelo híbrido

- **Durante o mês**: ranking calculado em tempo real com base nas leituras do mês atual — o usuário vê seu progresso
- **Final do mês**: pontuação salva na tabela `RANKING` como histórico permanente via cron job

### Lógica de pontuação

A pontuação recompensa quem consome **menos em relação à própria meta**, não quem simplesmente consome menos no absoluto (seria injusto com casas maiores).

```
percentual_energia = (consumo_energia / meta_luz) * 100
percentual_agua    = (consumo_agua / meta_agua) * 100
percentual_medio   = (percentual_energia + percentual_agua) / 2
pontuacao          = MAX(0, 100 - percentual_medio)
```

Quem atingir 0% da meta ganha 100 pontos. Quem ultrapassar a meta ganha 0 pontos.

### Código do `rankingController.js`

```js
const db = require('../config/db');

// GET /ranking — ranking em tempo real do mês atual
async function getCurrentRanking(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
        U.ID,
        U.NOME,
        SUM(CASE WHEN L.TIPO_RECURSO = 'ENERGIA' THEN L.VALOR_CONSUMO ELSE 0 END) as CONSUMO_ENERGIA,
        SUM(CASE WHEN L.TIPO_RECURSO = 'AGUA' THEN L.VALOR_CONSUMO ELSE 0 END) as CONSUMO_AGUA,
        CM.META_LUZ,
        CM.META_AGUA
      FROM USUARIO U
      LEFT JOIN DISPOSITIVOS D ON D.ID_USUARIO = U.ID
      LEFT JOIN LEITURA L ON L.ID_DISPOSITIVO = D.ID
        AND MONTH(L.HORA_DATA_LEITURA) = MONTH(NOW())
        AND YEAR(L.HORA_DATA_LEITURA) = YEAR(NOW())
      LEFT JOIN CONSUMO_META CM ON CM.ID_USUARIO = U.ID
      GROUP BY U.ID, U.NOME, CM.META_LUZ, CM.META_AGUA
    `);

    const ranking = rows
      .map(user => {
        if (!user.META_LUZ || !user.META_AGUA) return null;
        const pctEnergia = (user.CONSUMO_ENERGIA / user.META_LUZ) * 100;
        const pctAgua    = (user.CONSUMO_AGUA / user.META_AGUA) * 100;
        const pctMedio   = (pctEnergia + pctAgua) / 2;
        const pontuacao  = Math.max(0, 100 - pctMedio).toFixed(1);
        return { id: user.ID, nome: user.NOME, pontuacao: parseFloat(pontuacao) };
      })
      .filter(Boolean)
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .map((u, index) => ({ posicao: index + 1, ...u }));

    return res.status(200).json({ ranking });

  } catch (err) {
    console.error('Erro ao buscar ranking:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// GET /ranking/history — histórico de rankings mensais salvos
async function getRankingHistory(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT R.ID_RANKING, U.NOME, R.PONTUAÇÃO, R.MES_REFERENTE
       FROM RANKING R
       JOIN USUARIO U ON U.ID = R.ID_USUARIO
       ORDER BY R.MES_REFERENTE DESC, R.PONTUAÇÃO DESC`
    );
    return res.status(200).json({ history: rows });
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// Função interna — chamada pelo cron job no final do mês
async function saveMonthlyRanking() {
  const [rows] = await db.query(`
    SELECT 
      U.ID,
      SUM(CASE WHEN L.TIPO_RECURSO = 'ENERGIA' THEN L.VALOR_CONSUMO ELSE 0 END) as CONSUMO_ENERGIA,
      SUM(CASE WHEN L.TIPO_RECURSO = 'AGUA' THEN L.VALOR_CONSUMO ELSE 0 END) as CONSUMO_AGUA,
      CM.META_LUZ,
      CM.META_AGUA
    FROM USUARIO U
    LEFT JOIN DISPOSITIVOS D ON D.ID_USUARIO = U.ID
    LEFT JOIN LEITURA L ON L.ID_DISPOSITIVO = D.ID
      AND MONTH(L.HORA_DATA_LEITURA) = MONTH(NOW())
      AND YEAR(L.HORA_DATA_LEITURA) = YEAR(NOW())
    LEFT JOIN CONSUMO_META CM ON CM.ID_USUARIO = U.ID
    GROUP BY U.ID, CM.META_LUZ, CM.META_AGUA
  `);

  const mesReferente = new Date();

  for (const user of rows) {
    if (!user.META_LUZ || !user.META_AGUA) continue;
    const pctEnergia = (user.CONSUMO_ENERGIA / user.META_LUZ) * 100;
    const pctAgua    = (user.CONSUMO_AGUA / user.META_AGUA) * 100;
    const pontuacao  = Math.max(0, 100 - (pctEnergia + pctAgua) / 2).toFixed(1);

    await db.query(
      'INSERT INTO RANKING (ID_USUARIO, PONTUAÇÃO, MES_REFERENTE) VALUES (?, ?, ?)',
      [user.ID, pontuacao, mesReferente]
    );
  }

  console.log('Ranking mensal salvo com sucesso.');
}

module.exports = { getCurrentRanking, getRankingHistory, saveMonthlyRanking };
```

### Código do `rankingRoutes.js`

```js
const express = require('express');
const router = express.Router();
const { getCurrentRanking, getRankingHistory } = require('../controllers/rankingController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, getCurrentRanking);
router.get('/history', authMiddleware, getRankingHistory);

module.exports = router;
```

### Cron job no `app.js`

Instale a biblioteca:

```bash
npm install node-cron
```

Adicione no `app.js` após registrar as rotas:

```js
const cron = require('node-cron');
const { saveMonthlyRanking } = require('./src/controllers/rankingController');

// Roda todo dia 1 de cada mês às 00:05
cron.schedule('5 0 1 * *', () => {
  saveMonthlyRanking();
});
```

### Registrar a rota no `app.js`

```js
const rankingRoutes = require('./routes/rankingRoutes');
app.use('/ranking', rankingRoutes);
```

---

## Módulo 5 — Integração com o Frontend

### O que precisa ser feito no frontend

**`src/config/env.js`** — configurar a URL da API:

```js
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://SEU_IP_LOCAL:3000';
```

**`src/services/apiClient.js`** — substituir os mocks por chamadas reais. Exemplo de login real:

```js
import { API_URL } from '../config/env';

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json(); // retorna { token, user }
}

export async function getReadingsSummary(token) {
  const response = await fetch(`${API_URL}/readings/summary`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}
```

**`src/context/AuthContext.jsx`** — garantir que o token recebido no login está sendo salvo (ex: com `AsyncStorage`) e enviado nas requisições seguintes.

### IP local durante desenvolvimento

No celular físico ou emulador, `localhost` não acessa o computador — use o IP da máquina na rede:

- Windows: `ipconfig` → "Endereço IPv4"
- Mac/Linux: `ifconfig` → interface `en0` ou `wlan0`

Configure no `.env` do frontend:

```
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

---

## Módulo 6 — Integração com o sensor ESP

### Como o ESP se comunica com o backend

```
ESP liga e conecta ao WiFi
    ↓
ESP chama POST /auth/login para obter o token JWT
    ↓
ESP chama POST /devices para se registrar (primeira vez)
    ↓ salva o device_id recebido na memória (EEPROM)
A cada medição:
    ↓
ESP chama POST /readings com { id_dispositivo, tipo_recurso, valor_consumo }
```

### Exemplo de código para o ESP (Arduino/C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid     = "NOME_DA_REDE";
const char* password = "SENHA_DA_REDE";
const char* apiUrl   = "http://SEU_IP_LOCAL:3000";
const char* token    = "TOKEN_JWT_AQUI"; // obter via POST /auth/login
const int   deviceId = 1;               // obter via POST /devices

void enviarLeitura(String tipoRecurso, float valorConsumo) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(apiUrl) + "/readings");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + token);

  StaticJsonDocument<200> doc;
  doc["id_dispositivo"] = deviceId;
  doc["tipo_recurso"]   = tipoRecurso;
  doc["valor_consumo"]  = valorConsumo;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  Serial.println("Leitura enviada. Status: " + String(httpCode));
  http.end();
}

void loop() {
  float leituraEnergia = lerSensorEnergia(); // implementar conforme o sensor
  float leituraAgua    = lerSensorAgua();

  enviarLeitura("ENERGIA", leituraEnergia);
  enviarLeitura("AGUA", leituraAgua);

  delay(5000); // envia a cada 5 segundos
}
```

### Observações para o time de hardware

- O token JWT expira em 7 dias — combine com o time de backend uma estratégia de renovação automática ou aumento do prazo de expiração
- O `id_dispositivo` é o ID retornado por `POST /devices` ao registrar o sensor — salve na EEPROM do ESP para não precisar registrar toda vez que ligar
- Em produção, o `apiUrl` deve ser a URL do servidor hospedado na nuvem, não o IP local

---

## Build e deploy para produção

### Backend

1. Suba o repositório no GitHub (privado)
2. Acesse [railway.app](https://railway.app) ou [render.com](https://render.com) e conecte o repositório
3. Configure as variáveis de ambiente (as mesmas do `.env`) no painel do serviço
4. O serviço vai rodar `npm start` automaticamente
5. Você receberá uma URL pública (ex: `https://ecolize-backend.railway.app`)
6. Atualize `EXPO_PUBLIC_API_URL` no frontend para essa URL

### Frontend

1. Atualize `EXPO_PUBLIC_API_URL` para a URL de produção do backend
2. Para gerar o APK Android:
```bash
npx expo build:android
# ou com EAS Build (recomendado):
npm install -g eas-cli
eas build --platform android
```

### Checklist antes do deploy

- [ ] Remover `console.log` com dados sensíveis do código
- [ ] Confirmar que o `.env` não está no repositório
- [ ] Testar todas as rotas com a URL de produção
- [ ] Confirmar que o banco do Aiven aceita conexões do IP do servidor de produção
- [ ] Testar o app no celular físico apontando para a URL de produção

---

## Dúvidas frequentes

**O servidor não sobe / erro de conexão com o banco**
Verifique se as credenciais no `.env` estão corretas. Rode `SHOW DATABASES;` no Workbench para confirmar que o banco está acessível pelo Aiven.

**Token inválido / erro 401 em rotas protegidas**
O token expira em 7 dias. Faça login novamente para obter um novo token.

**`Cannot POST /rota` ou `Cannot GET /rota`**
A rota não está registrada. Verifique se adicionou a nova rota no `app.js` com `app.use('/prefixo', suasRoutes)`.

**Erro `ER_NO_SUCH_TABLE`**
A tabela não existe no banco. Rode o script SQL de criação no Workbench conectado ao servidor do Aiven.

**No celular o app não conecta à API**
Você está usando `localhost` — troque pelo IP local da máquina. Rode `ipconfig` (Windows) para descobrir o IP.
