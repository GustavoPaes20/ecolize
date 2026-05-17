export const WATER_TARIFFS_AM_2026 = {
  brackets: [
    { upTo: 10, pricePerM3: 6.42 },
    { upTo: 20, pricePerM3: 12.43 },
    { upTo: 30, pricePerM3: 18.98 },
    { upTo: 45, pricePerM3: 25.52 },
    { upTo: 60, pricePerM3: 28.87 },
    { upTo: Infinity, pricePerM3: 34.02 },
  ],
  sewageMultiplier: 0.80,
}

export const ENERGY_TARIFF_AM_2026 = {
  baseKwh: 0.835,
  flags: {
    green: 0.00,
    yellow: 0.018,
    red1: 0.044,
    red2: 0.078,
  },
  currentFlag: 'green',
}
