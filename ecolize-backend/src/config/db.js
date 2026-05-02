const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,   // ⚠️ não valida cert — TLS sem MITM protection
  },
});

// Teste de conectividade no startup
pool.getConnection()
  .then(conn => {
    console.log(`[DB] ✓ Conectado ao MySQL ${process.env.DB_HOST}`);
    conn.release();
  })
  .catch(err => {
    console.error('[DB] ✗ Falha ao conectar no MySQL:', err.message);
  });

module.exports = pool;