/**
 * ============================================================
 *  Ecolize — Cliente WebSocket (Socket.IO)
 * ============================================================
 *  Mantém UMA única conexão Socket.IO compartilhada por toda
 *  a aplicação. Inscritos (hooks/components) recebem updates
 *  via callbacks sem reabrir conexão.
 *
 *  Por que singleton:
 *    - React Native pode renderizar várias telas ao mesmo
 *      tempo (stack). Abrir uma conexão por tela esgota o
 *      pool do servidor e gasta bateria.
 *    - O Socket.IO já faz reconexão automática; queremos
 *      preservar esse estado entre navegações.
 *
 *  Eventos suportados:
 *    - "reading:update"  → nova leitura (água/energia)
 *    - "device:status"   → status do dispositivo
 *    - "control:state"   → estado dos controles (ON/OFF)
 * ============================================================
 */

import { io } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config/env'

const TOKEN_KEY = '@ecolize:token'

let socket = null
let connectingPromise = null

export async function getSocket() {
  if (socket && socket.connected) return socket
  if (connectingPromise) return connectingPromise

  connectingPromise = (async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY)

    socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: {
        token,
      },
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('[WS] Conectado ao servidor WebSocket')
    })

    socket.on('disconnect', (reason) => {
      console.warn('[WS] Socket desconectado:', reason)
    })

    socket.on('connect_error', (err) => {
      console.warn('[WS] Erro ao conectar:', err.message)
    })

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao conectar WebSocket'))
      }, 15000)

      socket.once('connect', () => {
        clearTimeout(timeout)
        resolve(socket)
      })

      socket.once('connect_error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  })()

  try {
    return await connectingPromise
  } finally {
    connectingPromise = null
  }
}

export async function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    connectingPromise = null
  }
}

export async function subscribeToReadings(callback) {
  const s = await getSocket()
  s.on('reading:update', callback)
  return () => s.off('reading:update', callback)
}

export async function subscribeToDeviceStatus(callback) {
  const s = await getSocket()
  s.on('device:status', callback)
  return () => s.off('device:status', callback)
}

export async function subscribeToControlState(callback) {
  const s = await getSocket()
  s.on('control:state', callback)
  return () => s.off('control:state', callback)
}

export async function sendControlToggle(recurso, acao) {
  const s = await getSocket()

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Aguardando ACK do servidor WebSocket expirado'))
    }, 8000)

    s.emit('control:toggle', { recurso, acao }, (ack) => {
      clearTimeout(timer)
      if (ack && ack.ok) {
        resolve(ack)
      } else {
        reject(new Error('ACK inválido do servidor WebSocket'))
      }
    })
  })
}
