const db = require('../config/db')
const { calculateEstimatedCosts } = require('../services/tarifaService')

function parsePayloadRaw(raw) {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return null
  }
}

function formatReading(row) {
  if (!row) return null
  return {
    valor_consumo: row.VALOR_CONSUMO,
    unidade: row.UNIDADE,
    payload: parsePayloadRaw(row.PAYLOAD_RAW) || row.PAYLOAD_RAW,
    timestamp: row.HORA_DATA_LEITURA,
  }
}

async function getLatestReading(req, res) {
  try {
    const [aguaRows] = await db.query(
      `SELECT VALOR_CONSUMO, UNIDADE, PAYLOAD_RAW, HORA_DATA_LEITURA
       FROM LEITURA
       WHERE TIPO_RECURSO = 'AGUA'
       ORDER BY HORA_DATA_LEITURA DESC
       LIMIT 1`
    )
    const [energiaRows] = await db.query(
      `SELECT VALOR_CONSUMO, UNIDADE, PAYLOAD_RAW, HORA_DATA_LEITURA
       FROM LEITURA
       WHERE TIPO_RECURSO = 'ENERGIA'
       ORDER BY HORA_DATA_LEITURA DESC
       LIMIT 1`
    )

    return res.status(200).json({
      agua: formatReading(aguaRows[0]),
      energia: formatReading(energiaRows[0]),
    })
  } catch (err) {
    console.error('Erro ao buscar última leitura:', err)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}

async function getLatestReadingWithCosts(req, res) {
  try {
    const [aguaRows] = await db.query(
      `SELECT VALOR_CONSUMO, UNIDADE, PAYLOAD_RAW, HORA_DATA_LEITURA
       FROM LEITURA
       WHERE TIPO_RECURSO = 'AGUA'
       ORDER BY HORA_DATA_LEITURA DESC
       LIMIT 1`
    )
    const [energiaRows] = await db.query(
      `SELECT VALOR_CONSUMO, UNIDADE, PAYLOAD_RAW, HORA_DATA_LEITURA
       FROM LEITURA
       WHERE TIPO_RECURSO = 'ENERGIA'
       ORDER BY HORA_DATA_LEITURA DESC
       LIMIT 1`
    )

    const consumoEnergia = energiaRows[0]?.VALOR_CONSUMO || 0
    const consumoAgua = aguaRows[0]?.VALOR_CONSUMO || 0

    const costs = await calculateEstimatedCosts(req.userId, consumoEnergia, consumoAgua)

    return res.status(200).json({
      consumo: {
        agua: formatReading(aguaRows[0]),
        energia: formatReading(energiaRows[0]),
      },
      custo_estimado: costs,
    })
  } catch (err) {
    console.error('Erro ao buscar leitura com custo:', err)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}

async function getStatus(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT EVENTO FROM EVENTO_COLETA
       ORDER BY ID DESC
       LIMIT 1`
    )
    return res.status(200).json({
      status: rows[0]?.EVENTO || 'offline',
    })
  } catch (err) {
    console.error('Erro ao buscar status ESP32:', err)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}

module.exports = { getLatestReading, getLatestReadingWithCosts, getStatus }
