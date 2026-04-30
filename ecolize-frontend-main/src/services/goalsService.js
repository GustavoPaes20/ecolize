import { delay } from '../utils/delay'
import { mockStore } from '../mocks/mockStore'

export const GOAL_CONFIG = {
  water: {
    title: 'Água',
    subtitle: 'Limite em litros (L).',
    valueStep: 500,
    minValue: 5000,
    currencyPerUnit: 67.7 / 15000,
  },
  energy: {
    title: 'Energia',
    subtitle: 'Limite em kWh.',
    valueStep: 10,
    minValue: 100,
    currencyPerUnit: 0.88,
  },
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function buildGoalsPayload() {
  return {
    values: { ...mockStore.goals },
    costs: {
      water: formatCurrency(mockStore.goals.water * GOAL_CONFIG.water.currencyPerUnit),
      energy: formatCurrency(mockStore.goals.energy * GOAL_CONFIG.energy.currencyPerUnit),
    },
  }
}

export async function getGoals() {
  await delay(220)
  return buildGoalsPayload()
}

export async function updateGoal(resourceKey, direction) {
  await delay(120)

  const config = GOAL_CONFIG[resourceKey]

  mockStore.goals[resourceKey] = Math.max(
    config.minValue,
    mockStore.goals[resourceKey] + config.valueStep * direction
  )

  return buildGoalsPayload()
}
