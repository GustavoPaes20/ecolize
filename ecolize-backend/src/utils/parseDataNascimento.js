/**
 * Aceita DD-MM-AAAA, AAAA-MM-DD, barras/pontos, só dígitos (AAAAMMDD, DDMMAAAA,
 * ou o formato compacto errado AAAADDMM ex.: 20061504 = 15/04/2006) e devolve AAAA-MM-DD para MySQL DATE.
 */

function isCalendarDate(y, m, d) {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

function isNotFuture(y, m, d) {
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth() + 1
  const todayD = today.getDate()
  if (y > todayY) return false
  if (y === todayY && m > todayM) return false
  if (y === todayY && m === todayM && d > todayD) return false
  return true
}

function parseFromParts(y, m, d) {
  if (!isCalendarDate(y, m, d) || y < 1900) return null
  if (!isNotFuture(y, m, d)) {
    return { ok: false, message: 'A data de nascimento não pode ser no futuro.' }
  }
  const yyyy = String(y)
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return { ok: true, value: `${yyyy}-${mm}-${dd}` }
}

/** Tenta interpretar 8 dígitos (sem ou com separadores já removidos). */
function parseEightDigits(digits) {
  if (!/^\d{8}$/.test(digits)) return null

  const attempts = [
    () => {
      const y = Number(digits.slice(0, 4))
      const m = Number(digits.slice(4, 6))
      const d = Number(digits.slice(6, 8))
      return { y, m, d }
    },
    () => {
      const d = Number(digits.slice(0, 2))
      const m = Number(digits.slice(2, 4))
      const y = Number(digits.slice(4, 8))
      return { y, m, d }
    },
    () => {
      const y = Number(digits.slice(0, 4))
      const d = Number(digits.slice(4, 6))
      const m = Number(digits.slice(6, 8))
      return { y, m, d }
    },
  ]

  for (const build of attempts) {
    const { y, m, d } = build()
    const out = parseFromParts(y, m, d)
    if (out) return out
  }
  return null
}

function parseDataNascimento(raw) {
  if (raw == null || raw === '') {
    return { ok: false, message: 'Data de nascimento é obrigatória.' }
  }

  const s0 = String(raw).trim()
  if (!s0) {
    return { ok: false, message: 'Data de nascimento é obrigatória.' }
  }

  const normalized = s0.replace(/[/.]/g, '-').replace(/\s+/g, '')
  const digitsOnly = normalized.replace(/\D/g, '')

  if (digitsOnly.length === 8 && !normalized.includes('-')) {
    const fromCompact = parseEightDigits(digitsOnly)
    if (fromCompact) return fromCompact
  }

  let y
  let m
  let d

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(normalized)
  const dmy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(normalized)

  if (iso) {
    y = Number(iso[1])
    m = Number(iso[2])
    d = Number(iso[3])
  } else if (dmy) {
    d = Number(dmy[1])
    m = Number(dmy[2])
    y = Number(dmy[3])
  } else if (digitsOnly.length === 8) {
    const fromCompact = parseEightDigits(digitsOnly)
    if (fromCompact) return fromCompact
    return {
      ok: false,
      message: 'Data de nascimento inválida. Use DD-MM-AAAA ou AAAA-MM-DD.',
    }
  } else {
    return {
      ok: false,
      message: 'Data de nascimento inválida. Use DD-MM-AAAA ou AAAA-MM-DD.',
    }
  }

  const out = parseFromParts(y, m, d)
  if (!out) {
    return { ok: false, message: 'Data de nascimento inválida.' }
  }
  return out
}

module.exports = { parseDataNascimento }
