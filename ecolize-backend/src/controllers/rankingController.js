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