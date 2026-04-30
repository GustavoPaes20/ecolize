const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// POST
async function register(req, res) {
  const { name, email, password, data_nascimento, genero, cidade, estado, pais } = req.body;

  if (!name || !email || !password || !data_nascimento) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const [existing] = await db.query(
      'SELECT ID FROM USUARIO WHERE EMAIL = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const dataCadastrada = new Date().toISOString().split('T')[0]; // data de hoje
    const [result] = await db.query(
      `INSERT INTO USUARIO 
        (NOME, EMAIL, SENHA, DATA_CADASTRADA, DATA_NASCIMENTO, GENERO, CIDADE, ESTADO, PAIS) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, dataCadastrada, data_nascimento, genero, cidade, estado, pais]
    );
    const userId = result.insertId;
    const token = generateToken(userId);

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      token,
      user: { id: userId, name, email },
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
// POST
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha e-mail e senha.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT ID, NOME, EMAIL, SENHA FROM USUARIO WHERE EMAIL = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.SENHA);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }
    const token = generateToken(user.ID);
    return res.status(200).json({
      token,
      user: { id: user.ID, name: user.NOME, email: user.EMAIL },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
// GET
async function me(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT ID, NOME, EMAIL, DATA_CADASTRADA FROM USUARIO WHERE ID = ?',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
module.exports = { register, login, me };