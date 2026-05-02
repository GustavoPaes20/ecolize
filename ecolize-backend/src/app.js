const express = require('express');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const goalsRoutes = require('./routes/goalsRoutes');
const devicesRoutes = require('./routes/devicesRoutes');    
const readingsRoutes = require('./routes/readingsRoutes');
const { startMqttSubscriber } = require('./services/mqttSubscriber'); // ← ADICIONA

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalsRoutes);
app.use('/devices', devicesRoutes);
app.use('/readings', readingsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startMqttSubscriber(); // ← ADICIONA
});