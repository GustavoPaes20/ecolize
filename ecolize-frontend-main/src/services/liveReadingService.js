import { request } from './apiClient'
import { delay } from '../utils/delay'

export async function getLiveReadingWithCosts() {
  try {
    const data = await request('/api/esp32/ultima-leitura-com-custos')
    return data
  } catch (err) {
    console.error('Erro ao buscar leitura ao vivo:', err)
    return null
  }
}

export async function startLiveReadingPolling(interval = 2000) {
  const subscribers = []

  function subscribe(callback) {
    subscribers.push(callback)
    return () => {
      subscribers.splice(subscribers.indexOf(callback), 1)
    }
  }

  function notifySubscribers(data) {
    subscribers.forEach(cb => cb(data))
  }

  async function poll() {
    while (true) {
      try {
        const data = await getLiveReadingWithCosts()
        if (data) {
          notifySubscribers(data)
        }
      } catch (err) {
        console.error('Erro no polling de leitura ao vivo:', err)
      }
      await delay(interval)
    }
  }

  poll().catch(console.error)

  return { subscribe }
}

export function formatConsumption(consumoValue, unidade) {
  if (!consumoValue) return '0'
  const valor = parseFloat(consumoValue)
  if (unidade === 'kWh') {
    return valor.toFixed(2)
  } else if (unidade === 'm³') {
    return valor.toFixed(3)
  }
  return valor.toFixed(2)
}

export function formatCurrency(value) {
  if (!value) return 'R$ 0,00'
  return `R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
