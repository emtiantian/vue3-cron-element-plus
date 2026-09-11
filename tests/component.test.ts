import { mount } from '@vue/test-utils'
import { it, expect } from 'vitest'
import VCron from '../src/components/VCron.vue'
it('preserves invalid external expressions without emitting', async () => {
  const w = mount(VCron, {
    props: { format: 'unix', modelValue: '0 * L * *', previewCount: 0, locale: 'en' },
  })
  expect(w.get('[role="alert"]').text()).toContain('not supported')
  expect(w.emitted('update:modelValue')).toBeUndefined()
  await w.setProps({ modelValue: '* * * * *' })
  expect(w.find('[role="alert"]').exists()).toBe(false)
})
it('keeps hidden fields verbatim when changing a mode', async () => {
  const w = mount(VCron, {
    props: { format: 'unix', modelValue: '*/5 02 * * 1', fields: ['minute'], previewCount: 0 },
  })
  await w.get('[data-testid="all-minute"] input').setValue(true)
  expect(w.emitted('update:modelValue')?.[0]).toEqual(['* 02 * * 1'])
})
it('shows config errors and translated messages', () => {
  const w = mount(VCron, { props: { format: 'unix', fields: [], locale: 'zh-CN' } })
  expect(w.get('[role="alert"]').text()).toContain('至少启用一个')
})
it('disables controls', () => {
  const w = mount(VCron, { props: { format: 'unix', disabled: true, previewCount: 0 } })
  expect(w.findAll('input').every((r) => r.attributes('disabled') !== undefined)).toBe(true)
})

it('shows all configured editors together and defaults to Chinese', () => {
  const w = mount(VCron, {
    props: {
      format: 'unix',
      fields: ['minute'],
      options: { minute: ['step', 'specific'] },
      previewCount: 0,
    },
  })
  expect(w.get('[data-testid="step-minute"]').text()).toContain('间隔')
  expect(
    w.get('[data-testid="specific-minute"]').findAll('.emtt-cron__values input:checked'),
  ).toHaveLength(60)
  expect(w.find('input[type="radio"]').exists()).toBe(false)
})
it('clears selections without emitting an invalid cron and restores all', async () => {
  const w = mount(VCron, {
    props: {
      format: 'unix',
      fields: ['minute'],
      options: { minute: ['step', 'specific'] },
      previewCount: 0,
    },
  })
  await w.get('[data-testid="all-minute"] input').setValue(false)
  expect(
    w.get('[data-testid="specific-minute"]').findAll('.emtt-cron__values input:checked'),
  ).toHaveLength(0)
  expect(w.get('[role="alert"]').text()).toContain('至少选择一个')
  expect(w.emitted('update:modelValue')).toBeUndefined()
  await w.get('[data-testid="all-minute"] input').setValue(true)
  expect(
    w.get('[data-testid="specific-minute"]').findAll('.emtt-cron__values input:checked'),
  ).toHaveLength(60)
  expect(w.find('[role="alert"]').exists()).toBe(false)
})
it('activates a mode directly through its inputs and obeys options', async () => {
  const w = mount(VCron, {
    props: {
      format: 'unix',
      fields: ['minute'],
      options: { minute: ['step', 'specific'] },
      previewCount: 0,
    },
  })
  expect(w.find('[data-testid="range-minute"]').exists()).toBe(false)
  expect(w.get('[data-testid="specific-minute"]').find('[data-testid="all-minute"]').exists()).toBe(
    true,
  )
  const input = w.get('[data-testid="step-minute"] input[aria-label="间隔"]')
  await input.setValue('5')
  await input.trigger('change')
  expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['0/5 * * * *'])
})

it('defaults to seconds with interval and specific editors and inline select all', async () => {
  const w = mount(VCron, { props: { previewCount: 0 } })
  expect(w.find('[data-testid="step-second"]').exists()).toBe(true)
  expect(w.find('[data-testid="range-second"]').exists()).toBe(false)
  const group = w.get('[data-testid="specific-second"]')
  expect(group.text()).toContain('全选')
  await group.get('[data-testid="all-second"] input').setValue(true)
  expect(group.findAll('.emtt-cron__values input:checked')).toHaveLength(60)
  expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['* * * * * *'])
  expect(w.find('[role="status"]').exists()).toBe(false)
  await group.get('[data-testid="all-second"] input').setValue(false)
  expect(group.findAll('.emtt-cron__values input:checked')).toHaveLength(0)
})
