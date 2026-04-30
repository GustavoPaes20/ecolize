const db = require('../config/db');

//busca a meta atual do usuário
async function getGoals(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT ID_CONFIG, META_AGUA, META_LUZ, VALOR_ENERGIA_KWH, VALOR_AGUA_M3
       FROM CONSUMO_META WHERE ID_USUARIO = ?`,
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhuma meta cadastrada.' });
    }
    return res.status(200).json({ goals: rows[0] });
  } catch (err) {
    console.error('Erro ao buscar metas:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

//cria ou atualiza a meta do usuário
async function upsertGoals(req, res) {
  const { meta_agua, meta_luz, valor_energia_kwh, valor_agua_m3 } = req.body;
  if (!valor_energia_kwh || !valor_agua_m3) {
    return res.status(400).json({ 
      message: 'Os valores de tarifa de energia e água são obrigatórios.' 
    });
  }
// Verifica se já existe uma meta para esse usuário
  try {
    const [existing] = await db.query(
      'SELECT ID_CONFIG FROM CONSUMO_META WHERE ID_USUARIO = ?',
      [req.userId]
    );
    if (existing.length > 0) {
      await db.query(
        `UPDATE CONSUMO_META 
         SET META_AGUA = ?, META_LUZ = ?, VALOR_ENERGIA_KWH = ?, VALOR_AGUA_M3 = ?
         WHERE ID_USUARIO = ?`,
        [meta_agua, meta_luz, valor_energia_kwh, valor_agua_m3, req.userId]
      );
      return res.status(200).json({ message: 'Meta atualizada com sucesso.' });
    } else {
      await db.query(
        `INSERT INTO CONSUMO_META (ID_USUARIO, META_AGUA, META_LUZ, VALOR_ENERGIA_KWH, VALOR_AGUA_M3)
         VALUES (?, ?, ?, ?, ?)`,
        [req.userId, meta_agua, meta_luz, valor_energia_kwh, valor_agua_m3]
      );
      return res.status(201).json({ message: 'Meta criada com sucesso.' });
    }
  } catch (err) {
    console.error('Erro ao salvar meta:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
module.exports = { getGoals, upsertGoals };