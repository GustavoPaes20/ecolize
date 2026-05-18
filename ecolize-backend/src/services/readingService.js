const db = require('../config/db')

async function getLastRawReading(deviceId, tipoRecurso) {
  const [rows] = await db.query(
    `SELECT VALOR_CONSUMO, PAYLOAD_RAW, HORA_DATA_LEITURA
     FROM LEITURA
     WHERE ID_DISPOSITIVO = ? AND TIPO_RECURSO = ?
     ORDER BY HORA_DATA_LEITURA DESC
     LIMIT 1`,
    [deviceId, tipoRecurso]
  )
  if (rows.length === 0) return null

  const raw = rows[0].PAYLOAD_RAW ? parsePayloadRaw(rows[0].PAYLOAD_RAW) : null
  return {
    valor_consumo: rows[0].VALOR_CONSUMO,
    hora_data_leitura: rows[0].HORA_DATA_LEITURA,
    raw,
  }
}

function parsePayloadRaw(payloadRaw) {
  try {
    return JSON.parse(payloadRaw)
  } catch (err) {
    return null
  }
}

module.exports = { getLastRawReading }
