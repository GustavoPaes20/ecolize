/**
 * ============================================================
 *  Ecolize — MQTT Subscriber (com bridge WebSocket)
 * ============================================================
 *  Inscreve nos tópicos do HiveMQ, grava as leituras no MySQL
 *  e, ao final de cada gravação bem-sucedida, emite o dado
 *  via WebSocket para os clientes conectados (app mobile).
 *
 *  Diferença para a versão anterior:
 *    - import dos helpers do socketServer
 *    - chamadas a emitReading() e emitDeviceStatus() ao final
 *      do fluxo de gravação
 *
 *  Tudo que existia antes continua funcionando. A camada de
 *  tempo real é apenas um "fan-out" adicional dos dados que
 *  já estavam sendo persistidos.
 * ============================================================
 */

const createMqttClient = require('../config/mqttClient')
const db = require('../config/db')
const { emitReading, emitDeviceStatus } = require('../websocket/socketServer')

const TOPIC_MAP = {
  [process.env.MQTT_TOPIC_VAZAO || 'ESP32/agua']: {
    tipo: 'leitura',
    recurso: 'AGUA',
    unidade: 'L/min',
  },
  [process.env.MQTT_TOPIC_CORRENTE || 'ESP32/luz']: {
    tipo: 'leitura',
    recurso: 'ENERGIA',
    unidade: 'kWh',
  },
  [process.env.MQTT_TOPIC_VAZAO_STATUS || 'ESP32/agua/status']: {
    tipo: 'evento',
    sensor: 'VAZAO_AGUA',
  },
  [process.env.MQTT_TOPIC_CORRENTE_STATUS || 'ESP32/luz/status']: {
    tipo: 'evento',
    sensor: 'CORRENTE_ELETRICA',
  },
}

function parseJsonPayload(raw) {
  try {
    return JSON.parse(raw)
  } catch (err) {
    return null
  }
}

function extractAccumulatedValue(parsed, recurso) {
  if (!parsed || typeof parsed !== 'object') return null

  if (recurso === 'AGUA') {
    if (typeof parsed.valor_acumulado === 'number') return { total: parsed.valor_acumulado, unit: 'm³' }
    if (typeof parsed.total_L === 'number') return { total: parsed.total_L / 1000, unit: 'm³' }
  }

  if (recurso === 'ENERGIA') {
    if (typeof parsed.valor_acumulado === 'number') return { total: parsed.valor_acumulado, unit: 'kWh' }
  }

  return null
}

async function getLastAccumulatedTotal(idDispositivo, tipoRecurso) {
  const [rows] = await db.query(
    `SELECT PAYLOAD_RAW FROM LEITURA
     WHERE ID_DISPOSITIVO = ? AND TIPO_RECURSO = ?
     ORDER BY HORA_DATA_LEITURA DESC
     LIMIT 1`,
    [idDispositivo, tipoRecurso]
  )

  if (rows.length === 0) return null
  const parsed = parseJsonPayload(rows[0].PAYLOAD_RAW)
  const acc = extractAccumulatedValue(parsed, tipoRecurso)
  return acc ? acc.total : null
}

async function descobrirDispositivo(tipoSensor) {
  const [rows] = await db.query(
    `SELECT ID, ID_USUARIO FROM DISPOSITIVOS
     WHERE (TIPO_SENSOR = ? OR TIPO_SENSOR = 'AMBOS')
       AND ATIVO = TRUE
     LIMIT 1`,
    [tipoSensor]
  )
  if (rows.length === 0) return null
  return { id: rows[0].ID, idUsuario: rows[0].ID_USUARIO }
}

async function gravarLeitura(topico, payload) {
  const config = TOPIC_MAP[topico]
  if (!config || config.tipo !== 'leitura') return

  const parsed = parseJsonPayload(payload)
  const accumulated = extractAccumulatedValue(parsed, config.recurso)

  const tipoSensor =
    config.recurso === 'AGUA' ? 'VAZAO_AGUA' : 'CORRENTE_ELETRICA'
  const dispositivo = await descobrirDispositivo(tipoSensor)

  if (!dispositivo) {
    console.warn(`[MQTT] Nenhum dispositivo cadastrado para ${tipoSensor}`)
    return
  }

  let valor = null
  let unidade = config.unidade
  let previousTotal = null
  const payloadRaw = payload

  if (accumulated) {
    previousTotal = await getLastAccumulatedTotal(
      dispositivo.id,
      config.recurso
    )
    if (previousTotal !== null) {
      const rawDelta = accumulated.total - previousTotal
      const delta = parseFloat(rawDelta.toFixed(5))
      if (delta < -0.0001) {
        console.warn(`[MQTT] Leitura acumulada menor que a anterior em ${topico}. Usando valor 0 e mantendo registro.`)
      }
      valor = delta < 0 ? 0 : delta
    } else {
      valor = 0
      console.log(`[MQTT] Primeira leitura acumulada para ${config.recurso}. Usando baseline 0.`)
    }
    unidade = accumulated.unit
  } else {
    const numeric = parseFloat(payload)
    if (Number.isNaN(numeric)) {
      console.warn(`[MQTT] Payload inválido em ${topico}: ${payload}`)
      return
    }
    valor = numeric
  }

  await db.query(
    `INSERT INTO LEITURA
     (ID_DISPOSITIVO, TIPO_RECURSO, VALOR_CONSUMO, UNIDADE, PAYLOAD_RAW)
     VALUES (?, ?, ?, ?, ?)`,
    [dispositivo.id, config.recurso, valor, unidade, payloadRaw]
  )

  const totalConsumido = previousTotal !== null ? previousTotal + valor : valor
  console.log(
    `[MQTT] ✓ Leitura ${config.recurso}: ${valor} ${unidade} (disp ${dispositivo.id}) - total acumulado ${totalConsumido.toFixed(5)} ${unidade}`
  )

  emitReading({
    tipo_recurso: config.recurso,
    valor_consumo: parseFloat(totalConsumido.toFixed(config.recurso === 'AGUA' ? 3 : 4)),
    unidade,
    timestamp: new Date().toISOString(),
    id_dispositivo: dispositivo.id,
    userId: dispositivo.idUsuario,
  })
}

async function gravarEvento(topico, payload) {
  const config = TOPIC_MAP[topico]
  if (!config || config.tipo !== 'evento') return

  const eventosValidos = ['coletando', 'pausado', 'offline', 'online']
  let statusPayload = payload

  try {
    const parsed = JSON.parse(payload)
    if (parsed && typeof parsed === 'object' && typeof parsed.state === 'string') {
      statusPayload = parsed.state
    }
  } catch (err) {
    // payload não é JSON, manter o valor original
  }

  if (!eventosValidos.includes(statusPayload)) {
    console.warn(`[MQTT] Status desconhecido em ${topico}: ${payload}`)
    return
  }

  const dispositivo = await descobrirDispositivo(config.sensor)
  if (!dispositivo) return

  await db.query(
    `INSERT INTO EVENTO_COLETA (ID_DISPOSITIVO, EVENTO) VALUES (?, ?)`,
    [dispositivo.id, statusPayload]
  )

  console.log(
    `[MQTT] ✓ Evento ${statusPayload} registrado (disp ${dispositivo.id})`
  )

  emitDeviceStatus({
    id_dispositivo: dispositivo.id,
    sensor: config.sensor,
    status: statusPayload,
    userId: dispositivo.idUsuario,
  })
}

function startMqttSubscriber() {
  console.log('[MQTT] Iniciando bridge HiveMQ → MySQL → WebSocket...')

  const client = createMqttClient({
    clientId: `${process.env.MQTT_CLIENT_ID || 'ecolize-backend'}-subscriber`,
  })
  const topics = Object.keys(TOPIC_MAP).filter(Boolean)

  client.on('connect', () => {
    console.log(`[MQTT] ✓ Subscriber conectado a ${process.env.MQTT_HOST}`)
    client.subscribe(topics, { qos: 1 }, (err, granted) => {
      if (err) {
        console.error('[MQTT] Erro ao se inscrever:', err)
        return
      }
      granted.forEach((g) => console.log(`[MQTT] ✓ Inscrito em ${g.topic} (QoS ${g.qos})`))
    })
  })

  client.on('message', async (topic, message) => {
    const payload = message.toString().trim()
    console.log(`[MQTT] ← [${topic}] ${payload}`)

    try {
      const config = TOPIC_MAP[topic]
      if (!config) return

      if (config.tipo === 'leitura') {
        await gravarLeitura(topic, payload)
      } else if (config.tipo === 'evento') {
        await gravarEvento(topic, payload)
      }
    } catch (err) {
      console.error(`[MQTT] Erro ao processar mensagem de ${topic}:`, err.message)
    }
  })

  client.on('reconnect', () => console.log('[MQTT] Reconectando...'))
  client.on('error', (err) => console.error('[MQTT] Erro:', err.message))
  client.on('offline', () => console.warn('[MQTT] Subscriber offline'))

  process.on('SIGINT', () => {
    console.log('\n[MQTT] Encerrando bridge...')
    client.end(false, {}, () => process.exit(0))
  })

  return client
}

module.exports = { startMqttSubscriber }
