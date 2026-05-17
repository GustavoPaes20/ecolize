import { delay } from '../utils/delay'
import { mockStore } from '../mocks/mockStore'
import { WATER_TARIFFS_AM_2026, ENERGY_TARIFF_AM_2026 } from '../constants/tariffs'

export const GOAL_CONFIG = {
  water: {
    title: 'Água',
    subtitle: 'Limite em litros (L).',
    valueStep: 500,
    minValue: 0,
    maxValue: 9999,
  },
  energy: {
    title: 'Energia',
    subtitle: 'Limite em kWh.',
    valueStep: 10,
    minValue: 0,
    maxValue: 9999,
  },
}

function calcularCustoAgua(limite_litros) {
  const m3 = limite_litros / 1000
  let custo_agua = 0

  if (m3 <= WATER_TARIFFS_AM_2026.brackets[0].upTo) {
    custo_agua = m3 * WATER_TARIFFS_AM_2026.brackets[0].pricePerM3
  } else if (m3 <= WATER_TARIFFS_AM_2026.brackets[1].upTo) {
    custo_agua = (WATER_TARIFFS_AM_2026.brackets[0].upTo * WATER_TARIFFS_AM_2026.brackets[0].pricePerM3) +
                 ((m3 - WATER_TARIFFS_AM_2026.brackets[0].upTo) * WATER_TARIFFS_AM_2026.brackets[1].pricePerM3)
  } else if (m3 <= WATER_TARIFFS_AM_2026.brackets[2].upTo) {
    custo_agua = (WATER_TARIFFS_AM_2026.brackets[0].upTo * WATER_TARIFFS_AM_2026.brackets[0].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[1].upTo - WATER_TARIFFS_AM_2026.brackets[0].upTo) * WATER_TARIFFS_AM_2026.brackets[1].pricePerM3) +
                 ((m3 - WATER_TARIFFS_AM_2026.brackets[1].upTo) * WATER_TARIFFS_AM_2026.brackets[2].pricePerM3)
  } else if (m3 <= WATER_TARIFFS_AM_2026.brackets[3].upTo) {
    custo_agua = (WATER_TARIFFS_AM_2026.brackets[0].upTo * WATER_TARIFFS_AM_2026.brackets[0].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[1].upTo - WATER_TARIFFS_AM_2026.brackets[0].upTo) * WATER_TARIFFS_AM_2026.brackets[1].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[2].upTo - WATER_TARIFFS_AM_2026.brackets[1].upTo) * WATER_TARIFFS_AM_2026.brackets[2].pricePerM3) +
                 ((m3 - WATER_TARIFFS_AM_2026.brackets[2].upTo) * WATER_TARIFFS_AM_2026.brackets[3].pricePerM3)
  } else if (m3 <= WATER_TARIFFS_AM_2026.brackets[4].upTo) {
    const bracket3Size = WATER_TARIFFS_AM_2026.brackets[3].upTo - WATER_TARIFFS_AM_2026.brackets[2].upTo
    custo_agua = (WATER_TARIFFS_AM_2026.brackets[0].upTo * WATER_TARIFFS_AM_2026.brackets[0].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[1].upTo - WATER_TARIFFS_AM_2026.brackets[0].upTo) * WATER_TARIFFS_AM_2026.brackets[1].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[2].upTo - WATER_TARIFFS_AM_2026.brackets[1].upTo) * WATER_TARIFFS_AM_2026.brackets[2].pricePerM3) +
                 (bracket3Size * WATER_TARIFFS_AM_2026.brackets[3].pricePerM3) +
                 ((m3 - WATER_TARIFFS_AM_2026.brackets[3].upTo) * WATER_TARIFFS_AM_2026.brackets[4].pricePerM3)
  } else {
    const bracket3Size = WATER_TARIFFS_AM_2026.brackets[3].upTo - WATER_TARIFFS_AM_2026.brackets[2].upTo
    const bracket4Size = WATER_TARIFFS_AM_2026.brackets[4].upTo - WATER_TARIFFS_AM_2026.brackets[3].upTo
    custo_agua = (WATER_TARIFFS_AM_2026.brackets[0].upTo * WATER_TARIFFS_AM_2026.brackets[0].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[1].upTo - WATER_TARIFFS_AM_2026.brackets[0].upTo) * WATER_TARIFFS_AM_2026.brackets[1].pricePerM3) +
                 ((WATER_TARIFFS_AM_2026.brackets[2].upTo - WATER_TARIFFS_AM_2026.brackets[1].upTo) * WATER_TARIFFS_AM_2026.brackets[2].pricePerM3) +
                 (bracket3Size * WATER_TARIFFS_AM_2026.brackets[3].pricePerM3) +
                 (bracket4Size * WATER_TARIFFS_AM_2026.brackets[4].pricePerM3) +
                 ((m3 - WATER_TARIFFS_AM_2026.brackets[4].upTo) * WATER_TARIFFS_AM_2026.brackets[5].pricePerM3)
  }

  const custo_esgoto = custo_agua * WATER_TARIFFS_AM_2026.sewageMultiplier
  const custo_total = custo_agua + custo_esgoto

  return custo_total
}

function calcularCustoEnergia(limite_kwh) {
  const BANDEIRA_ATUAL = ENERGY_TARIFF_AM_2026.flags[ENERGY_TARIFF_AM_2026.currentFlag]
  const custo_total = limite_kwh * (ENERGY_TARIFF_AM_2026.baseKwh + BANDEIRA_ATUAL)
  return custo_total
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function calculateGoalCost(resourceKey, value) {
  const normalizedValue = Number.isFinite(Number(value)) ? Number(value) : 0

  if (resourceKey === 'water') {
    return formatCurrency(calcularCustoAgua(normalizedValue))
  }

  return formatCurrency(calcularCustoEnergia(normalizedValue))
}

export async function setGoalValue(resourceKey, value) {
  await delay(120)

  const config = GOAL_CONFIG[resourceKey]
  const normalizedValue = Number.isFinite(Number(value)) ? Number(value) : 0
  mockStore.goals[resourceKey] = Math.max(
    config.minValue,
    Math.min(config.maxValue, normalizedValue)
  )

  return buildGoalsPayload()
}

function buildGoalsPayload() {
  return {
    values: { ...mockStore.goals },
    costs: {
      water: formatCurrency(calcularCustoAgua(mockStore.goals.water)),
      energy: formatCurrency(calcularCustoEnergia(mockStore.goals.energy)),
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

  let newValue = mockStore.goals[resourceKey] + config.valueStep * direction
  mockStore.goals[resourceKey] = Math.max(config.minValue, Math.min(config.maxValue, newValue))

  return buildGoalsPayload()
}
