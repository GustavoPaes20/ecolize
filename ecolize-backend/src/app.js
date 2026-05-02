const express = require('express');
require('dotenv').config();
const cron = require('node-cron');
const { saveMonthlyRanking } = require('./controllers/rankingController');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const goalsRoutes = require('./routes/goalsRoutes');
const devicesRoutes = require('./routes/devicesRoutes');    
const readingsRoutes = require('./routes/readingsRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const { startMqttSubscriber } = require('./services/mqttSubscriber');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalsRoutes);
app.use('/devices', devicesRoutes);
app.use('/readings', readingsRoutes);
app.use('/ranking', rankingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

cron.schedule('5 0 1 * *', () => {
  saveMonthlyRanking();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startMqttSubscriber();
});