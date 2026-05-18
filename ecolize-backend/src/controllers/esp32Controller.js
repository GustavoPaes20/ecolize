const { getEsp32Device } = require('../services/deviceService')
const { getLastRawReading } = require('../services/readingService')

function parseTimestamp(value) {
  if (!value) return new Date()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function validateNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value)
}

async function createEsp32Reading(req, res, tipoRecurso) {
  const deviceId = req.header('X-Device-Id')
  const deviceToken = req.header('X-Device-Token')
  const { valor_acumulado, timestamp, rssi, bateria_pct } = req.body

  if (!deviceId) {
    return res.status(400).json({ message: 'Cabeçalho X-Device-Id é obrigatório.' })
  }

  if (!validateNumber(valor_acumulado)) {
    return res.status(400).json({ message: 'valor_acumulado deve ser um número válido.' })
  }

  const leituraHora = parseTimestamp(timestamp)
  if (timestamp && !leituraHora) {
    return res.status(400).json({ message: 'timestamp inválido. Use ISO 8601.' })
  }

  try {
    const device = await getEsp32Device(deviceId, deviceToken)
    if (!device) {
      return res.status(401).json({ message: 'Dispositivo ESP32 não autorizado ou não encontrado.' })
    }

    const lastReading = await getLastRawReading(device.ID, tipoRecurso)
    let consumoDelta = 0

    if (lastReading && lastReading.raw && typeof lastReading.raw.valor_acumulado === 'number') {
      if (valor_acumulado < lastReading.raw.valor_acumulado) {
        return res.status(400).json({
          message: 'Leitura acumulada menor que a última leitura registrada. Verifique o medidor ou o ESP.',
          anomaly: true,
        })
      }
      consumoDelta = parseFloat((valor_acumulado - lastReading.raw.valor_acumulado).toFixed(4))
      if (consumoDelta < 0) {
        return res.status(400).json({ message: 'Consumo calculado inválido.' })
      }
      const tempoSegundos = (leituraHora - new Date(lastReading.hora_data_leitura)) / 1000
      if (tempoSegundos < 60) {
        return res.status(429).json({ message: 'Leitura muito frequente. Aguarde pelo menos 60 segundos entre envios.' })
      }
    }

    const payloadRaw = JSON.stringify({
      valor_acumulado,
      timestamp: leituraHora.toISOString(),
      rssi: validateNumber(rssi) ? rssi : null,
      bateria_pct: validateNumber(bateria_pct) ? bateria_pct : null,
    })

    const unidade = tipoRecurso === 'ENERGIA' ? 'kWh' : 'm³'
    const query = `INSERT INTO LEITURA
      (ID_DISPOSITIVO, TIPO_RECURSO, VALOR_CONSUMO, HORA_DATA_LEITURA, UNIDADE, PAYLOAD_RAW)
      VALUES (?, ?, ?, ?, ?, ?)`

    const [result] = await require('../config/db').query(
      query,
      [device.ID, tipoRecurso, consumoDelta, leituraHora, unidade, payloadRaw]
    )

    return res.status(201).json({
      status: 'ok',
      leitura_id: result.insertId,
      consumo_delta: consumoDelta,
      proxima_leitura_em_segundos: 300,
    })
  } catch (err) {
    console.error('Erro ao registrar leitura ESP32:', err)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}

async function createEsp32WaterReading(req, res) {
  return createEsp32Reading(req, res, 'AGUA')
}

async function createEsp32EnergyReading(req, res) {
  return createEsp32Reading(req, res, 'ENERGIA')
}

module.exports = { createEsp32WaterReading, createEsp32EnergyReading }
