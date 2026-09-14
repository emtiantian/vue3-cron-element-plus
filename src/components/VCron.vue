<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus/es/components/tabs/index'
import { ElInputNumber } from 'element-plus/es/components/input-number/index'
import { ElCheckboxGroup, ElCheckbox } from 'element-plus/es/components/checkbox/index'
import type { CronProps, CronState, CronField, CronMode, CronIssue, CronEmits } from '../types'
import {
  bounds,
  CronError,
  defaultExpression,
  fieldsFor,
  modesFor,
  nextSchedules,
  parseExpression,
  serializeField,
  validateConfig,
} from '../core/cron'
import { en, zhCN } from '../locales'
const props = withDefaults(defineProps<CronProps>(), {
  format: 'unix-seconds',
  disabled: false,
  locale: 'zh-CN',
  previewCount: 3,
})
const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const emit = defineEmits<CronEmits>()
const local = ref(defaultExpression(props.format))
const value = computed(() => props.modelValue ?? local.value)
const state = ref<CronState>({})
const active = ref('')
const issue = ref<CronIssue>()
const visible = ref<CronField[]>([])
const editIssue = ref<CronIssue>()
const messages = computed(() => {
  const base = props.locale === 'zh-CN' ? zhCN : en
  return {
    ...base,
    ...props.messages,
    fields: { ...base.fields, ...props.messages?.fields },
    modes: { ...base.modes, ...props.messages?.modes },
    errors: { ...base.errors, ...props.messages?.errors },
  }
})
function asIssue(e: unknown): CronIssue {
  return e instanceof CronError ? { code: e.code, field: e.field } : { code: 'syntax' }
}
watch(
  () => props.format,
  () => {
    if (props.modelValue === undefined) local.value = defaultExpression(props.format)
  },
)
watch(
  () => [value.value, props.format, props.fields, props.options],
  () => {
    issue.value = undefined
    editIssue.value = undefined
    try {
      visible.value = validateConfig(props.format, props.fields, props.options)
      state.value = parseExpression(value.value, props.format)
      if (!visible.value.includes(active.value as CronField)) active.value = visible.value[0]
    } catch (e) {
      issue.value = asIssue(e)
    }
  },
  { immediate: true, deep: true },
)
const allowed = (f: CronField): readonly CronMode[] =>
  props.options?.[f] ?? (f === 'second' ? ['step', 'specific'] : modesFor(f, props.format))
const restricted = (f: CronField) =>
  !allowed(f).includes(state.value[f]!.mode) &&
  !(state.value[f]!.mode === 'all' && allowed(f).includes('specific'))
function commit(f: CronField) {
  if (props.disabled || issue.value) return
  editIssue.value = undefined
  try {
    // 保留所有未修改的字段内容，包括隐藏字段。
    const keys = fieldsFor(props.format),
      parts = value.value.trim().split(/\s+/)
    parts[keys.indexOf(f)] = serializeField(state.value[f]!)
    if (props.format === 'quartz' && (f === 'day' || f === 'week')) {
      const other = f === 'day' ? 'week' : 'day'
      if (state.value[f]!.mode !== 'none') parts[keys.indexOf(other)] = '?'
      else if (parts[keys.indexOf(other)] === '?') parts[keys.indexOf(other)] = '*'
    }
    const result = parts.join(' ')
    parseExpression(result, props.format)
    if (result !== value.value) {
      local.value = result
      emit('update:modelValue', result)
      emit('change', result)
    }
  } catch (e) {
    editIssue.value = asIssue(e)
  }
}
const numbers = (f: CronField) => {
  const [min, max] = bounds(f, props.format)
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}
const selectedValues = (f: CronField) =>
  state.value[f]!.mode === 'all'
    ? numbers(f)
    : state.value[f]!.mode === 'specific'
      ? state.value[f]!.values
      : []
function toggleAll(f: CronField, checked: unknown) {
  if (props.disabled) return
  state.value[f]!.mode = checked ? 'all' : 'specific'
  state.value[f]!.values = checked ? numbers(f) : []
  commit(f)
}
function selectValues(f: CronField, values: unknown) {
  if (props.disabled) return
  const selection = values as number[]
  state.value[f]!.values = selection
  state.value[f]!.mode = selection.length === numbers(f).length ? 'all' : 'specific'
  commit(f)
}
function activate(f: CronField, mode: CronMode) {
  if (props.disabled) return
  state.value[f]!.mode = mode
  commit(f)
}
const preview = computed(() => {
  if (issue.value || editIssue.value || props.previewCount === 0) return { dates: [] as Date[] }
  try {
    return {
      dates: nextSchedules(
        value.value,
        props.format,
        props.previewCount,
        props.timeZone ?? browserTimeZone,
      ),
    }
  } catch (e) {
    return { dates: [] as Date[], issue: asIssue(e) }
  }
})
const currentIssue = computed(() => issue.value ?? editIssue.value ?? preview.value.issue)
watch(
  currentIssue,
  (v) => {
    if (v) emit('error', v)
  },
  { immediate: true },
)
const displayDate = (date: Date) =>
  new Intl.DateTimeFormat(props.locale, {
    timeZone: props.timeZone ?? browserTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
</script>
<template>
  <section class="emtt-cron" :aria-label="messages.expression">
    <ElTabs v-if="!issue" v-model="active" type="card">
      <ElTabPane
        v-for="field in visible"
        :key="field"
        :name="field"
        :label="messages.fields[field]"
      >
        <div class="emtt-cron__editor">
          <p v-if="restricted(field)" role="status">{{ messages.restricted }}</p>
          <div v-if="allowed(field).includes('none')" class="emtt-cron__row">
            <ElCheckbox
              :model-value="state[field]!.mode === 'none'"
              :disabled="disabled || state[field]!.mode === 'none'"
              @change="activate(field, 'none')"
            >
              {{ messages.modes.none }}
            </ElCheckbox>
          </div>
          <div
            v-if="allowed(field).includes('step')"
            class="emtt-cron__row emtt-cron__inputs"
            :data-active="state[field]!.mode === 'step'"
            :data-testid="`step-${field}`"
          >
            <strong class="emtt-cron__title">{{ messages.modes.step }}</strong>
            <label
              >{{ messages.start
              }}<ElInputNumber
                v-model="state[field]!.start"
                :disabled="disabled"
                :min="bounds(field, format)[0]"
                :max="bounds(field, format)[1]"
                :precision="0"
                :aria-label="messages.modes.step + messages.start"
                @change="activate(field, 'step')"
            /></label>
            <label
              >{{ messages.interval
              }}<ElInputNumber
                v-model="state[field]!.step"
                :disabled="disabled"
                :min="1"
                :max="bounds(field, format)[1] - bounds(field, format)[0] + 1"
                :precision="0"
                :aria-label="messages.interval"
                @change="activate(field, 'step')"
            /></label>
          </div>
          <div
            v-if="allowed(field).includes('range')"
            class="emtt-cron__row emtt-cron__inputs"
            :data-active="state[field]!.mode === 'range'"
            :data-testid="`range-${field}`"
          >
            <strong class="emtt-cron__title">{{ messages.modes.range }}</strong>
            <label
              >{{ messages.start
              }}<ElInputNumber
                v-model="state[field]!.start"
                :disabled="disabled"
                :min="bounds(field, format)[0]"
                :max="bounds(field, format)[1]"
                :precision="0"
                :aria-label="messages.modes.range + messages.start"
                @change="activate(field, 'range')"
            /></label>
            <label
              >{{ messages.end
              }}<ElInputNumber
                v-model="state[field]!.end"
                :disabled="disabled"
                :min="bounds(field, format)[0]"
                :max="bounds(field, format)[1]"
                :precision="0"
                :aria-label="messages.end"
                @change="activate(field, 'range')"
            /></label>
          </div>
          <div
            v-if="allowed(field).includes('specific') || allowed(field).includes('all')"
            class="emtt-cron__row emtt-cron__specific"
            :data-testid="`specific-${field}`"
          >
            <div class="emtt-cron__specific-heading">
              <strong class="emtt-cron__title">{{ messages.modes.specific }}</strong>
              <ElCheckbox
                :model-value="selectedValues(field).length === numbers(field).length"
                :indeterminate="
                  selectedValues(field).length > 0 &&
                  selectedValues(field).length < numbers(field).length
                "
                :disabled="disabled"
                :data-testid="`all-${field}`"
                @change="toggleAll(field, $event)"
                >{{ messages.modes.all }}</ElCheckbox
              >
            </div>
            <ElCheckboxGroup
              v-if="allowed(field).includes('specific')"
              :model-value="selectedValues(field)"
              :disabled="disabled"
              class="emtt-cron__values"
              :aria-label="messages.modes.specific"
              @update:model-value="selectValues(field, $event)"
            >
              <ElCheckbox v-for="n in numbers(field)" :key="n" :value="n">{{ n }}</ElCheckbox>
            </ElCheckboxGroup>
          </div>
        </div>
      </ElTabPane>
    </ElTabs>
    <div class="emtt-cron__expression">
      <span>{{ messages.expression }}</span
      ><code>{{ value }}</code>
    </div>
    <p v-if="currentIssue" role="alert" class="emtt-cron__error">
      {{ messages.errors[currentIssue.code] }}
    </p>
    <div v-else-if="preview.dates.length" class="emtt-cron__preview">
      <strong>{{ messages.next }}</strong>
      <ol>
        <li v-for="date in preview.dates" :key="date.toISOString()">
          <time :datetime="date.toISOString()">{{ displayDate(date) }}</time>
        </li>
      </ol>
    </div>
  </section>
</template>
