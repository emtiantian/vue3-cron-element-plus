import { describe, it, expect } from 'vitest'
import {
  parseExpression,
  serializeExpression,
  nextSchedules,
  validateConfig,
} from '../src/core/cron'
describe('cron formats', () => {
  it.each(['unix', 'unix-seconds', 'quartz'] as const)('round trips %s', (f) => {
    const s =
      f === 'unix' ? '*/5 1-3 * * 1,3' : f === 'quartz' ? '0 0/5 1-3 ? * 2,4' : '0 0/5 1-3 * * 1,3'
    expect(parseExpression(serializeExpression(parseExpression(s, f), f), f)).toEqual(
      parseExpression(s, f),
    )
  })
  it('rejects unsupported and invalid values', () => {
    for (const s of ['60 * * * *', '* * * * ?', '* * L * *', '* * * * * *', '*/0 * * * *'])
      expect(() => parseExpression(s)).toThrow()
  })
  it('validates both configuration layers', () => {
    expect(() => validateConfig('unix', [])).toThrow()
    expect(() => validateConfig('unix', ['second'])).toThrow()
    expect(() => validateConfig('unix', undefined, { minute: [] })).toThrow()
    expect(() => validateConfig('unix', undefined, { day: ['none'] })).toThrow()
  })
  it('requires Quartz day/week exclusivity', () => {
    expect(() => parseExpression('0 * * * * *', 'quartz')).toThrow()
    expect(() => parseExpression('0 * * ? * ?', 'quartz')).toThrow()
  })
  it('maps Quartz Sunday and ranges correctly', () => {
    expect(
      nextSchedules(
        '0 0 0 ? * 1',
        'quartz',
        1,
        'UTC',
        new Date('2026-09-10T00:00:00Z'),
      )[0].toISOString(),
    ).toBe('2026-09-13T00:00:00.000Z')
    expect(
      nextSchedules(
        '0 0 0 ? * 2-6',
        'quartz',
        1,
        'UTC',
        new Date('2026-09-11T00:00:00Z'),
      )[0].toISOString(),
    ).toBe('2026-09-14T00:00:00.000Z')
  })
  it('keeps Unix day/week OR semantics', () => {
    expect(
      nextSchedules(
        '0 0 1 * 1',
        'unix',
        1,
        'UTC',
        new Date('2026-09-10T00:00:00Z'),
      )[0].toISOString(),
    ).toBe('2026-09-14T00:00:00.000Z')
  })
  it('validates timezone', () =>
    expect(() => nextSchedules('* * * * *', 'unix', 3, 'bad/zone')).toThrow())
})
