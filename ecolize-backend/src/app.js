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
const app = express();
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalsRoutes);
app.use('/devices', devicesRoutes);
app.use('/readings', readingsRoutes);
app.use('/ranking', rankingRoutes); 

// Confirma se o servidor tá rodando
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});