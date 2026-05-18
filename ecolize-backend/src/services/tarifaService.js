const db = require('../config/db')

async function hasTable(tableName) {
  try {
    const [rows] = await db.query('SHOW TABLES LIKE ?', [tableName])
    return rows.length > 0
  } catch (err) {
    return false
  }
}

async function hasColumn(table, column) {
  try {
    const [rows] = await db.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column])
    return rows.length > 0
  } catch (err) {
    return false
  }
}

function firstDayOfMonth(date) {
  const month = new Date(date)
  month.setDate(1)
  month.setHours(0, 0, 0, 0)
  return month
}

async function getUserBillingProfile(userId) {
  const defaults = {
    classe_agua: 'RESIDENCIAL',
    classe_energia: 'B1_RESIDENCIAL',
    tem_esgoto: true,
  }

  const supports = await hasColumn('USUARIO', 'CLASSE_AGUA')
  if (!supports) {
    return defaults
  }
  const [rows] = await db.query(
    'SELECT CLASSE_AGUA, CLASSE_ENERGIA, TEM_ESGOTO FROM USUARIO WHERE ID = ?',
    [userId]
  )
  if (rows.length === 0) return defaults
  return {
    classe_agua: rows[0].CLASSE_AGUA || defaults.classe_agua,
    classe_energia: rows[0].CLASSE_ENERGIA || defaults.classe_energia,
    tem_esgoto: rows[0].TEM_ESGOTO !== undefined ? Boolean(rows[0].TEM_ESGOTO) : defaults.tem_esgoto,
  }
}

async function getUserMetaTariffs(userId) {
  if (!(await hasTable('CONSUMO_META'))) {
    return null
  }
  const [rows] = await db.query(
    'SELECT META_AGUA, META_LUZ, VALOR_ENERGIA_KWH, VALOR_AGUA_M3 FROM CONSUMO_META WHERE ID_USUARIO = ?',
    [userId]
  )
  return rows.length > 0 ? rows[0] : null
}

async function getWaterTariffFaixas(classe) {
  if (!(await hasTable('tarifa_agua_faixa'))) return null
  const [rows] = await db.query(
    `SELECT faixa_min_m3 AS faixaMin, faixa_max_m3 AS faixaMax, valor_m3 AS valor
     FROM tarifa_agua_faixa
     WHERE classe = ?
       AND vigente_desde <= CURDATE()
       AND (vigente_ate IS NULL OR vigente_ate >= CURDATE())
     ORDER BY faixa_min_m3 ASC`,
    [classe]
  )
  return rows
}

async function getEsgotoConfig(classe) {
  if (!(await hasTable('tarifa_esgoto_config'))) return null
  const [rows] = await db.query(
    `SELECT percentual
     FROM tarifa_esgoto_config
     WHERE classe = ?
       AND vigente_desde <= CURDATE()
       AND (vigente_ate IS NULL OR vigente_ate >= CURDATE())
     ORDER BY vigente_desde DESC
     LIMIT 1`,
    [classe]
  )
  return rows.length > 0 ? rows[0] : null
}

async function getEnergyTariff(classe) {
  if (!(await hasTable('tarifa_energia'))) return null
  const [rows] = await db.query(
    `SELECT tarifa_base_kwh AS tarifaBase
     FROM tarifa_energia
     WHERE classe = ?
       AND vigente_desde <= CURDATE()
       AND (vigente_ate IS NULL OR vigente_ate >= CURDATE())
     ORDER BY vigente_desde DESC
     LIMIT 1`,
    [classe]
  )
  return rows.length > 0 ? rows[0] : null
}

async function getBandeiraForMonth(referenceDate) {
  if (!(await hasTable('bandeira_tarifaria'))) return null
  const month = firstDayOfMonth(referenceDate).toISOString().slice(0, 10)
  const [rows] = await db.query(
    `SELECT cor, adicional_kwh AS adicional
     FROM bandeira_tarifaria
     WHERE mes_referencia = ?`,
    [month]
  )
  return rows.length > 0 ? rows[0] : null
}

function calculateWaterCostFromFaixas(consumo, faixas) {
  let total = 0
  const detalhamento = []
  for (const faixa of faixas) {
    const inicio = Number(faixa.faixaMin)
    const fim = faixa.faixaMax !== null ? Number(faixa.faixaMax) : Infinity
    if (consumo <= inicio) break
    const volume = Math.max(0, Math.min(consumo, fim) - inicio)
    if (volume <= 0) continue
    const subtotal = volume * Number(faixa.valor)
    total += subtotal
    detalhamento.push({ faixa: `${inicio}–${faixa.faixaMax ?? '∞'} m³`, volume, valor_m3: Number(faixa.valor), subtotal: parseFloat(subtotal.toFixed(2)) })
  }
  return { total: parseFloat(total.toFixed(2)), detalhamento }
}

async function calculateWaterBill(userId, consumo, profile) {
  const tarifaFaixas = await getWaterTariffFaixas(profile.classe_agua)
  const meta = await getUserMetaTariffs(userId)

  if (tarifaFaixas && tarifaFaixas.length > 0) {
    const waterCost = calculateWaterCostFromFaixas(consumo, tarifaFaixas)
    const esgotoConfig = await getEsgotoConfig(profile.classe_agua)
    const valorEsgoto = esgotoConfig && profile.tem_esgoto ? parseFloat((waterCost.total * Number(esgotoConfig.percentual)).toFixed(2)) : 0
    return {
      valor_agua: waterCost.total,
      valor_esgoto: valorEsgoto,
      valor_total: parseFloat((waterCost.total + valorEsgoto).toFixed(2)),
      detalhamento: {
        faixas: waterCost.detalhamento,
        esgoto_percentual: esgotoConfig ? Number(esgotoConfig.percentual) : null,
      },
    }
  }

  if (meta && meta.VALOR_AGUA_M3 !== undefined && meta.VALOR_AGUA_M3 !== null) {
    const valor_agua = parseFloat((consumo * Number(meta.VALOR_AGUA_M3)).toFixed(2))
    return {
      valor_agua,
      valor_esgoto: null,
      valor_total: valor_agua,
      detalhamento: { tarifa_linear: Number(meta.VALOR_AGUA_M3) },
    }
  }

  return null
}

async function calculateEnergyBill(userId, consumo, profile, referenceDate = new Date()) {
  const tarifa = await getEnergyTariff(profile.classe_energia)
  const bandeira = await getBandeiraForMonth(referenceDate)
  const meta = await getUserMetaTariffs(userId)

  if (tarifa) {
    const valor_energia = parseFloat((consumo * Number(tarifa.tarifaBase)).toFixed(2))
    const valor_bandeira = bandeira ? parseFloat((consumo * Number(bandeira.adicional)).toFixed(2)) : 0
    return {
      valor_energia,
      valor_bandeira,
      valor_total: parseFloat((valor_energia + valor_bandeira).toFixed(2)),
      detalhamento: {
        tarifa_base: Number(tarifa.tarifaBase),
        bandeira: bandeira ? bandeira.cor : 'VERDE',
        adicional_por_kwh: bandeira ? Number(bandeira.adicional) : 0,
      },
    }
  }

  if (meta && meta.VALOR_ENERGIA_KWH !== undefined && meta.VALOR_ENERGIA_KWH !== null) {
    const valor_energia = parseFloat((consumo * Number(meta.VALOR_ENERGIA_KWH)).toFixed(2))
    return {
      valor_energia,
      valor_bandeira: 0,
      valor_total: valor_energia,
      detalhamento: { tarifa_linear: Number(meta.VALOR_ENERGIA_KWH) },
    }
  }

  return null
}

async function calculateEstimatedCosts(userId, consumoEnergia, consumoAgua, referenceDate = new Date()) {
  const profile = await getUserBillingProfile(userId)
  const result = {
    energia: null,
    agua: null,
    total: null,
    profile,
  }

  if (typeof consumoEnergia === 'number') {
    result.energia = await calculateEnergyBill(userId, consumoEnergia, profile, referenceDate)
  }
  if (typeof consumoAgua === 'number') {
    result.agua = await calculateWaterBill(userId, consumoAgua, profile)
  }

  const energyTotal = result.energia?.valor_total || 0
  const waterTotal = result.agua?.valor_total || 0
  if (result.energia || result.agua) {
    result.total = parseFloat((energyTotal + waterTotal).toFixed(2))
  }

  return result
}

module.exports = {
  calculateEstimatedCosts,
  getUserBillingProfile,
}
