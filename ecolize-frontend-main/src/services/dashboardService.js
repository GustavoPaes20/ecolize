import { delay } from '../utils/delay'
import { mockStore } from '../mocks/mockStore'
import { request } from './apiClient'

export async function getHomeDashboard() {
  await delay(250)
  
  try {
    const data = await request('/api/esp32/ultima-leitura-com-custos')
    
    if (data && data.consumo) {
      const dashboard = { ...mockStore.dashboard }
      
      dashboard.consumptionCards = dashboard.consumptionCards.map(card => {
        if (card.resourceKey === 'water' && data.consumo.agua) {
          return {
            ...card,
            value: `${parseFloat(data.consumo.agua.valor_consumo || 0).toFixed(2)} m³`,
          }
        }
        if (card.resourceKey === 'energy' && data.consumo.energia) {
          return {
            ...card,
            value: `${parseFloat(data.consumo.energia.valor_consumo || 0).toFixed(2)} kWh`,
          }
        }
        return card
      })
      
      if (data.custo_estimado && data.custo_estimado.total) {
        dashboard.estimatedSavings = `R$ ${data.custo_estimado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
      
      return dashboard
    }
  } catch (err) {
    console.warn('Erro ao buscar dados ao vivo, usando mock:', err.message)
  }
  
  return mockStore.dashboard
}

export async function getLiveReadingData() {
  try {
    return await request('/api/esp32/ultima-leitura-com-custos')
  } catch (err) {
    console.error('Erro ao buscar dados ao vivo:', err)
    return null
  }
}
