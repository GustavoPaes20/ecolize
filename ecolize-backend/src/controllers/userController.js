const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { parseDataNascimento } = require('../utils/parseDataNascimento');

// GET 
async function getProfile(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT ID, NOME, EMAIL, DATA_NASCIMENTO, GENERO, 
              CIDADE, ESTADO, PAIS, DATA_CADASTRADA 
       FROM USUARIO WHERE ID = ?`,
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
// PUT
async function updateProfile(req, res) {
  const { name, genero, cidade, estado, pais, data_nascimento } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'O nome é obrigatório.' });
  }

  const parsedBirth = parseDataNascimento(data_nascimento);
  if (!parsedBirth.ok) {
    return res.status(400).json({ message: parsedBirth.message });
  }

  try {
    await db.query(
      `UPDATE USUARIO 
       SET NOME = ?, GENERO = ?, CIDADE = ?, ESTADO = ?, PAIS = ?, DATA_NASCIMENTO = ?
       WHERE ID = ?`,
      [name, genero, cidade, estado, pais, parsedBirth.value, req.userId]
    );
    return res.status(200).json({ message: 'Perfil atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// PUT
async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT SENHA FROM USUARIO WHERE ID = ?',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
// Verifica se a senha atual está correta
    const passwordMatch = await bcrypt.compare(current_password, rows[0].SENHA);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha atual incorreta.' });
    }
// Criptografa a nova senha e salva
    const newHash = await bcrypt.hash(new_password, 10);
    await db.query(
      'UPDATE USUARIO SET SENHA = ? WHERE ID = ?',
      [newHash, req.userId]
    );
    return res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('Erro ao trocar senha:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
module.exports = { getProfile, updateProfile, changePassword };