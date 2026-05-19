/**
 * ============================================================
 *  Ecolize — WebSocket Server
 * ============================================================
 *  Responsável por manter conexões em tempo real com o app
 *  mobile. Recebe eventos do mqttSubscriber (após gravação no
 *  banco) e os retransmite para os clientes inscritos.
 *
 *  Eventos emitidos para o cliente:
 *    - "reading:update"   → nova leitura de água ou energia
 *    - "device:status"    → evento de coleta (online/offline/etc.)
 *    - "control:state"    → estado atual dos controles (água/luz)
 *
 *  Eventos recebidos do cliente:
 *    - "control:toggle"   → app mobile solicita ligar/desligar
 *                            o controle de água ou luz
 *    - "subscribe:user"   → cliente entra na sala do seu usuário
 * ============================================================
 */

const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

let io = null

function initSocketServer(httpServer) {
  if (io) {
    console.warn('[WS] Servidor já inicializado. Ignorando nova chamada.')
    return io
  }

  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token

    if (!token) {
      socket.userId = null
      return next()
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id || decoded.userId || null
      next()
    } catch (err) {
      console.warn('[WS] Token inválido na conexão:', err.message)
      socket.userId = null
      next()
    }
  })

  io.on('connection', (socket) => {
    const userTag = socket.userId ? `user:${socket.userId}` : 'anônimo'
    console.log(`[WS] ✓ Cliente conectado (${socket.id}) — ${userTag}`)

    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }
    socket.join('global')

    socket.on('subscribe:user', (userId) => {
      if (!userId) return
      socket.join(`user:${userId}`)
      console.log(`[WS] ${socket.id} entrou em user:${userId}`)
    })

    socket.on('control:toggle', (payload, ack) => {
      console.log(`[WS] ← control:toggle de ${userTag}:`, payload)
      io.emit('internal:control:toggle', { ...payload, userId: socket.userId })
      if (typeof ack === 'function') ack({ ok: true })
    })

    socket.on('disconnect', (reason) => {
      console.log(`[WS] ✗ Cliente desconectado (${socket.id}) — ${reason}`)
    })

    socket.on('error', (err) => {
      console.error(`[WS] Erro no socket ${socket.id}:`, err.message)
    })
  })

  console.log('[WS] ✓ Servidor WebSocket inicializado')
  return io
}

function getIO() {
  if (!io) {
    throw new Error(
      '[WS] Servidor WebSocket não inicializado. Chame initSocketServer(httpServer) no app.js antes.'
    )
  }
  return io
}

function emitReading(reading) {
  if (!io) return

  const event = {
    tipo_recurso: reading.tipo_recurso,
    valor_consumo: reading.valor_consumo,
    unidade: reading.unidade,
    timestamp: reading.timestamp || new Date().toISOString(),
    id_dispositivo: reading.id_dispositivo,
  }

  if (reading.userId) {
    io.to(`user:${reading.userId}`).emit('reading:update', event)
  }
  io.to('global').emit('reading:update', event)

  console.log(
    `[WS] → reading:update ${event.tipo_recurso} ${event.valor_consumo} ${event.unidade}`
  )
}

function emitDeviceStatus({ id_dispositivo, sensor, status, userId }) {
  if (!io) return

  const event = {
    id_dispositivo,
    sensor,
    status,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    io.to(`user:${userId}`).emit('device:status', event)
  }
  io.to('global').emit('device:status', event)

  console.log(`[WS] → device:status ${sensor}=${status}`)
}

function emitControlState({ recurso, estado, userId }) {
  if (!io) return

  const event = {
    recurso,
    estado,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    io.to(`user:${userId}`).emit('control:state', event)
  }
  io.to('global').emit('control:state', event)

  console.log(`[WS] → control:state ${recurso}=${estado}`)
}

function emitEstimatedCosts({ userId, custos }) {
  if (!io) return

  const event = {
    custo_estimado: custos || null,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    io.to(`user:${userId}`).emit('custo_estimado:update', event)
  }
  io.to('global').emit('custo_estimado:update', event)

  console.log(`[WS] → custo_estimado:update ${userId || 'global'}`)
}

module.exports = {
  initSocketServer,
  getIO,
  emitReading,
  emitDeviceStatus,
  emitControlState,
  emitEstimatedCosts,
}
