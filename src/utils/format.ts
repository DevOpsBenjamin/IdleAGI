import Decimal from 'break_infinity.js'

const SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'
]

/**
 * Format a Decimal or number into a standard abbreviated string (e.g., 1.25M, 4.50B)
 * or scientific notation for huge values (e.g., 1.00e45).
 */
export function formatNumber(value: Decimal | number, precision = 2): string {
  const d = value instanceof Decimal ? value : new Decimal(value)

  if (Number.isNaN(d.m)) return '0.00'
  if (!Number.isFinite(d.m)) return 'Infinity'
  if (d.eq(0)) return '0'

  const abs = d.abs()

  if (abs.lt(0.001) && abs.gt(0)) {
    return d.toExponential(precision)
  }

  if (abs.lt(1000)) {
    return d.toFixed(precision === 0 ? 0 : precision)
  }

  const exponent = Math.floor(d.log10())
  const tier = Math.floor(exponent / 3)

  if (tier < SUFFIXES.length) {
    const scale = new Decimal(10).pow(tier * 3)
    const scaled = d.div(scale)
    return `${scaled.toFixed(precision)} ${SUFFIXES[tier]}`
  }

  return d.toExponential(precision)
}

/**
 * Format Currency ($)
 */
export function formatMoney(value: Decimal | number, precision = 2): string {
  return `$${formatNumber(value, precision)}`
}

/**
 * Format Rate per second (e.g., +12.5 T/s)
 */
export function formatRate(value: Decimal | number, unit = 'T/s', precision = 1): string {
  const d = value instanceof Decimal ? value : new Decimal(value)
  const sign = d.gte(0) ? '+' : ''
  return `${sign}${formatNumber(d, precision)} ${unit}`
}

/**
 * Format Compute (FLOPS)
 */
export function formatFlops(tflops: Decimal | number, precision = 2): string {
  const d = tflops instanceof Decimal ? tflops : new Decimal(tflops)
  if (d.lt(0.001)) {
    return `${d.mul(1e6).toFixed(0)} MFLOPS`
  }
  if (d.lt(1)) {
    return `${d.mul(1000).toFixed(precision)} GFLOPS`
  }
  if (d.lt(1000)) {
    return `${d.toFixed(precision)} TFLOPS`
  }
  if (d.lt(1e6)) {
    return `${d.div(1000).toFixed(precision)} PFLOPS`
  }
  return `${d.div(1e6).toFixed(precision)} EFLOPS`
}

/**
 * Format Memory Capacity (Mo, Go, To, Po)
 */
export function formatVram(vramGB: Decimal | number, precision = 1): string {
  const d = vramGB instanceof Decimal ? vramGB : new Decimal(vramGB)
  if (d.lt(1)) {
    return `${d.mul(1024).toFixed(0)} Mo`
  }
  if (d.lt(1024)) {
    return `${d.toFixed(precision)} Go`
  }
  if (d.lt(1024 * 1024)) {
    return `${d.div(1024).toFixed(precision)} To`
  }
  return `${d.div(1024 * 1024).toFixed(precision)} Po`
}

/**
 * Format Memory Bandwidth (Mo/s, Go/s, To/s)
 */
export function formatBandwidth(gbps: Decimal | number, precision = 1): string {
  const d = gbps instanceof Decimal ? gbps : new Decimal(gbps)
  if (d.lt(1)) {
    return `${d.mul(1000).toFixed(0)} Mo/s`
  }
  if (d.lt(1000)) {
    return `${d.toFixed(precision)} Go/s`
  }
  return `${d.div(1000).toFixed(precision)} To/s`
}

/**
 * Format Power in Watts (W, kW, MW, GW)
 */
export function formatWatts(watts: Decimal | number, precision = 1): string {
  const d = watts instanceof Decimal ? watts : new Decimal(watts)
  if (d.lt(1000)) {
    return `${d.toFixed(precision)} W`
  }
  if (d.lt(1e6)) {
    return `${d.div(1000).toFixed(precision)} kW`
  }
  if (d.lt(1e9)) {
    return `${d.div(1e6).toFixed(precision)} MW`
  }
  return `${d.div(1e9).toFixed(precision)} GW`
}
