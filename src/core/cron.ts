import { CronExpressionParser } from 'cron-parser'
import type {
  CronField,
  CronFormat,
  CronMode,
  CronOptions,
  CronState,
  FieldState,
  CronErrorCode,
} from '../types'
export class CronError extends Error {
  constructor(
    public code: CronErrorCode,
    public field?: CronField,
  ) {
    super(code)
  }
}
export const fieldsFor = (format: CronFormat): CronField[] => {
  if (!['unix', 'unix-seconds', 'quartz'].includes(format)) throw new CronError('format')
  return [
    ...(format === 'unix' ? [] : ['second' as const]),
    'minute',
    'hour',
    'day',
    'month',
    'week',
  ]
}
export const defaultExpression = (format: CronFormat) =>
  format === 'unix' ? '* * * * *' : format === 'quartz' ? '0 * * * * ?' : '0 * * * * *'
export function bounds(field: CronField, format: CronFormat): [number, number] {
  return field === 'day'
    ? [1, 31]
    : field === 'month'
      ? [1, 12]
      : field === 'week'
        ? [format === 'quartz' ? 1 : 0, 7]
        : [0, field === 'hour' ? 23 : 59]
}
export function modesFor(field: CronField, format: CronFormat): CronMode[] {
  if (field === 'second' || field === 'minute') return ['step', 'specific']
  if (field === 'hour') return ['all', 'step', 'specific']
  if (field === 'week')
    return format === 'quartz' ? ['all', 'none', 'specific'] : ['all', 'specific']
  if (field === 'day' || field === 'month')
    return format === 'quartz' ? ['all', 'none', 'step', 'specific'] : ['all', 'step', 'specific']
  return ['specific']
}
export function validateConfig(
  format: CronFormat,
  fields?: readonly CronField[],
  options: CronOptions = {},
) {
  const available = fieldsFor(format),
    visible = fields ?? available
  if (
    !visible.length ||
    new Set(visible).size !== visible.length ||
    visible.some((f) => !available.includes(f))
  )
    throw new CronError('fields')
  for (const [key, modes] of Object.entries(options)) {
    const field = key as CronField
    if (
      !available.includes(field) ||
      !Array.isArray(modes) ||
      !modes.length ||
      new Set(modes).size !== modes.length ||
      modes.some((m) => !modesFor(field, format).includes(m))
    )
      throw new CronError('options', field)
  }
  return [...visible]
}
function parseField(part: string, field: CronField, format: CronFormat): FieldState {
  const [min, max] = bounds(field, format)
  const state: FieldState = { mode: 'all', start: min, end: max, step: 1, values: [] }
  const number = (s: string) => {
    if (!/^\d+$/.test(s) || +s < min || +s > max) throw new CronError('syntax', field)
    return +s
  }
  if (part === '*') return state
  if (part === '?') {
    if (!modesFor(field, format).includes('none')) throw new CronError('syntax', field)
    return { ...state, mode: 'none' }
  }
  if (/[LW#]/i.test(part)) throw new CronError('unsupported', field)
  if (/^(\d+|\*)\/\d+$/.test(part)) {
    const [a, b] = part.split('/')
    const step = +b
    if (step < 1 || step > max - min + 1) throw new CronError('syntax', field)
    return { ...state, mode: 'step', start: a === '*' ? min : number(a), step }
  }
  if (/^\d+-\d+$/.test(part)) {
    const [a, b] = part.split('-').map(number)
    if (a > b) throw new CronError('syntax', field)
    return { ...state, mode: 'range', start: a, end: b }
  }
  if (/^\d+(,\d+)*$/.test(part))
    return {
      ...state,
      mode: 'specific',
      values: [...new Set(part.split(',').map(number))].sort((a, b) => a - b),
    }
  throw new CronError('syntax', field)
}
export function parseExpression(value: string, format: CronFormat = 'unix'): CronState {
  const fields = fieldsFor(format),
    parts = value.trim().split(/\s+/)
  if (parts.length !== fields.length) throw new CronError('syntax')
  const result: CronState = {}
  fields.forEach((f, i) => {
    result[f] = parseField(parts[i], f, format)
  })
  if (format === 'quartz' && (result.day!.mode === 'none') === (result.week!.mode === 'none'))
    throw new CronError('dayWeek')
  return result
}
export function serializeField(s: FieldState): string {
  switch (s.mode) {
    case 'all':
      return '*'
    case 'none':
      return '?'
    case 'step':
      return `${s.start}/${s.step}`
    case 'range':
      return `${s.start}-${s.end}`
    case 'specific':
      if (!s.values.length) throw new CronError('selection')
      return [...new Set(s.values)].sort((a, b) => a - b).join(',')
  }
}
export function serializeExpression(state: CronState, format: CronFormat = 'unix') {
  const value = fieldsFor(format)
    .map((f) => serializeField(state[f]!))
    .join(' ')
  parseExpression(value, format)
  return value
}
export function nextSchedules(
  value: string,
  format: CronFormat = 'unix',
  count = 3,
  timeZone?: string,
  currentDate: Date = new Date(),
): Date[] {
  const state = parseExpression(value, format)
  if (!Number.isInteger(count) || count < 0 || count > 20) throw new CronError('schedule')
  if (timeZone) {
    try {
      new Intl.DateTimeFormat('en', { timeZone }).format(currentDate)
    } catch {
      throw new CronError('schedule')
    }
  }
  let normalized = serializeExpression(state, format)
  if (format === 'quartz') {
    const parts = fieldsFor(format).map((f) => serializeField(state[f]!))
    const week = state.week!
    if (week.mode !== 'none' && week.mode !== 'all') {
      const values =
        week.mode === 'specific'
          ? week.values
          : Array.from({ length: 7 }, (_, i) => i + 1).filter((n) =>
              week.mode === 'range'
                ? n >= week.start && n <= week.end
                : n >= week.start && (n - week.start) % week.step === 0,
            )
      parts[5] = values.map((n) => n - 1).join(',')
    }
    normalized = parts.map((p) => (p === '?' ? '*' : p)).join(' ')
  }
  try {
    const iterator = CronExpressionParser.parse(normalized, { tz: timeZone, currentDate })
    return Array.from({ length: count }, () => iterator.next().toDate())
  } catch {
    throw new CronError('schedule')
  }
}
