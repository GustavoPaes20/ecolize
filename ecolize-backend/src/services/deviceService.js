const db = require('../config/db')

async function hasColumn(table, column) {
  try {
    const [rows] = await db.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column])
    return rows.length > 0
  } catch (err) {
    return false
  }
}

async function getEsp32Device(deviceId, token) {
  const tokenColumn = await hasColumn('DISPOSITIVOS', 'TOKEN_ESP')
  const activeColumn = await hasColumn('DISPOSITIVOS', 'ATIVO')
  if (tokenColumn) {
    if (!token) return null
    const query = activeColumn
      ? 'SELECT * FROM DISPOSITIVOS WHERE ID = ? AND TOKEN_ESP = ? AND ATIVO = TRUE'
      : 'SELECT * FROM DISPOSITIVOS WHERE ID = ? AND TOKEN_ESP = ?'
    const [rows] = await db.query(query, [deviceId, token])
    return rows[0] || null
  }

  const query = activeColumn
    ? 'SELECT * FROM DISPOSITIVOS WHERE ID = ? AND ATIVO = TRUE'
    : 'SELECT * FROM DISPOSITIVOS WHERE ID = ?'
  const [rows] = await db.query(query, [deviceId])
  return rows[0] || null
}

module.exports = { getEsp32Device, hasColumn }
