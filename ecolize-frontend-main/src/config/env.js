import { NativeModules, Platform } from 'react-native'

const BACKEND_PORT = 3000

function getDevServerHost() {
  // Em dev mode, o bundle JS é baixado do Metro server.
  // scriptURL é algo como "http://192.168.0.10:8081/index.bundle?platform=..."
  // Extraímos o host (IP da máquina dev) para apontar a API no mesmo IP.
  const scriptURL = NativeModules?.SourceCode?.scriptURL || ''
  const match = scriptURL.match(/^https?:\/\/([^:/]+)/)
  return match ? match[1] : null
}

function resolveApiBaseUrl() {
  // 1ª prioridade: override manual via variável de ambiente
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }

  // 2ª prioridade: no web, backend está na mesma máquina
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}`
  }

  // 3ª prioridade: detecta automaticamente o IP do Metro server (mobile)
  const host = getDevServerHost()
  if (host) {
    return `http://${host}:${BACKEND_PORT}`
  }

  // Fallback final
  return `http://localhost:${BACKEND_PORT}`
}

export const API_BASE_URL = resolveApiBaseUrl()
