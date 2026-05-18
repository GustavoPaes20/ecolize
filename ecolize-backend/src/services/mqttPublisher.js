/**
 * ============================================================
 *  Ecolize — MQTT Publisher
 * ============================================================
 *  Recebe comandos do app mobile (via WebSocket) e publica
 *  no broker MQTT para que o ESP32 execute fisicamente
 *  (ligar/desligar relé de água ou luz).
 *
 *  Tópicos de comando esperados pelo ESP:
 *    - ESP32/agua/cmd  → payload "ON" | "OFF"
 *    - ESP32/luz/cmd   → payload "ON" | "OFF"
 *
 *  Este arquivo NÃO se inscreve em nada — apenas publica.
 *  É um cliente MQTT separado do subscriber para isolar
 *  responsabilidades e facilitar reconexão.
 * ============================================================
 */

const createMqttClient = require('../config/mqttClient')
const { getIO } = require('../websocket/socketServer')

const TOPIC_COMMAND_AGUA =
  process.env.MQTT_TOPIC_VAZAO_CMD || 'ESP32/agua/cmd'
const TOPIC_COMMAND_LUZ =
  process.env.MQTT_TOPIC_CORRENTE_CMD || 'ESP32/luz/cmd'

let publisherClient = null

function startMqttPublisher() {
  console.log('[MQTT-PUB] Iniciando publisher de comandos...')

  publisherClient = createMqttClient({
    clientId: `${process.env.MQTT_CLIENT_ID || 'ecolize-backend'}-publisher`,
  })

  publisherClient.on('connect', () => {
    console.log(`[MQTT-PUB] ✓ Publisher conectado a ${process.env.MQTT_HOST}`)
  })

  publisherClient.on('error', (err) => {
    console.error('[MQTT-PUB] Erro:', err.message)
  })

  publisherClient.on('offline', () => {
    console.warn('[MQTT-PUB] Publisher offline')
  })

  publisherClient.on('reconnect', () => {
    console.log('[MQTT-PUB] Reconectando publisher...')
  })

  try {
    const io = getIO()
    io.on('internal:control:toggle', ({ recurso, acao, userId }) => {
      const topic = recurso === 'AGUA' ? TOPIC_COMMAND_AGUA : TOPIC_COMMAND_LUZ
      const payload = acao === 'ON' ? 'ON' : 'OFF'

      if (!publisherClient || !publisherClient.connected) {
        console.warn('[MQTT-PUB] Publisher não conectado. Ignorando comando.')
        return
      }

      publisherClient.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT-PUB] Erro ao publicar comando:', err.message)
          return
        }
        console.log(`[MQTT-PUB] → [${topic}] ${payload}`)
        io.emit('control:state', { recurso, estado: payload, timestamp: new Date().toISOString() })
      })
    })
  } catch (err) {
    console.error('[MQTT-PUB] Não foi possível registrar listener:', err.message)
  }

  process.on('SIGINT', () => {
    if (publisherClient) {
      publisherClient.end(false, {}, () => process.exit(0))
    }
  })

  return publisherClient
}

function publishCommand(recurso, acao) {
  if (!publisherClient || !publisherClient.connected) {
    throw new Error('[MQTT-PUB] Publisher não conectado')
  }
  const topic = recurso === 'AGUA' ? TOPIC_COMMAND_AGUA : TOPIC_COMMAND_LUZ
  const payload = acao === 'ON' ? 'ON' : 'OFF'
  publisherClient.publish(topic, payload, { qos: 1 })
  console.log(`[MQTT-PUB] → [${topic}] ${payload} (REST)`)
}

module.exports = { startMqttPublisher, publishCommand }
