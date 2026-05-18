/**
 * ============================================================
 *  Ecolize — Entry Point do Backend
 * ============================================================
 *  Mudanças em relação à versão anterior:
 *   1) Cria um http.Server explícito para anexar Socket.IO
 *   2) Inicializa o WebSocket (initSocketServer)
 *   3) Inicia o MQTT Publisher para receber comandos do app
 *   4) Mantém todas as rotas REST e o cron job de ranking
 *
 *  Ordem de inicialização (importante!):
 *   - HTTP server escutando
 *   - WebSocket anexado
 *   - MQTT Publisher (depende do io)
 *   - MQTT Subscriber (depende do io)
 * ============================================================
 */

require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const { saveMonthlyRanking } = require('./controllers/rankingController');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const goalsRoutes = require('./routes/goalsRoutes');
const devicesRoutes = require('./routes/devicesRoutes');
const readingsRoutes = require('./routes/readingsRoutes');
const esp32Routes = require('./routes/esp32Routes');
const rankingRoutes = require('./routes/rankingRoutes');

const { startMqttSubscriber } = require('./services/mqttSubscriber');
const { startMqttPublisher } = require('./services/mqttPublisher');
const { initSocketServer } = require('./websocket/socketServer');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalsRoutes);
app.use('/devices', devicesRoutes);
app.use('/readings', readingsRoutes);
app.use('/api/esp32', esp32Routes);
app.use('/ranking', rankingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', websocket: 'enabled' });
});

cron.schedule('5 0 1 * *', () => {
  saveMonthlyRanking();
});

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Servidor HTTP + WS rodando na porta ${PORT}`);
  startMqttPublisher();
  startMqttSubscriber();
});