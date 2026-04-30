const db = require('../config/db');

// POST para registrar um novo dispositivo vinculado ao usuário
async function registerDevice(req, res) {
  const { endereco_ip } = req.body;

  if (!endereco_ip) {
    return res.status(400).json({ message: 'Endereço IP do dispositivo é obrigatório.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO DISPOSITIVOS (ID_USUARIO, ENDEREÇO_IP) VALUES (?, ?)',
      [req.userId, endereco_ip]
    );
    return res.status(201).json({
      message: 'Dispositivo registrado com sucesso.',
      device: {
        id: result.insertId,
        id_usuario: req.userId,
        endereco_ip,
      },
    });
  } catch (err) {
    console.error('Erro ao registrar dispositivo:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
// GET que lista todos os dispositivos do usuário
async function listDevices(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT ID, ENDEREÇO_IP FROM DISPOSITIVOS WHERE ID_USUARIO = ?',
      [req.userId]
    );
    return res.status(200).json({ devices: rows });
  } catch (err) {
    console.error('Erro ao listar dispositivos:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// DELETE
async function deleteDevice(req, res) {
  const { id } = req.params;
// Garante que o dispositivo pertence ao usuário logado
  try { 
    const [rows] = await db.query(
      'SELECT ID FROM DISPOSITIVOS WHERE ID = ? AND ID_USUARIO = ?',
      [id, req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dispositivo não encontrado.' });
    }
    await db.query('DELETE FROM DISPOSITIVOS WHERE ID = ?', [id]);
    return res.status(200).json({ message: 'Dispositivo removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover dispositivo:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
module.exports = { registerDevice, listDevices, deleteDevice };