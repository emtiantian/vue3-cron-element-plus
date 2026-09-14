export type CronFormat = 'unix' | 'unix-seconds' | 'quartz'
export type CronField = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week'
export type CronMode = 'all' | 'none' | 'step' | 'range' | 'specific'
export type CronOptions = Partial<Record<CronField, readonly CronMode[]>>
export interface FieldState {
  mode: CronMode
  start: number
  end: number
  step: number
  values: number[]
}
export type CronState = Partial<Record<CronField, FieldState>>
export type CronErrorCode =
  'format' | 'fields' | 'options' | 'syntax' | 'unsupported' | 'dayWeek' | 'selection' | 'schedule'
export interface CronIssue {
  code: CronErrorCode
  field?: CronField
}
/** VCron 发出的事件。 */
export interface CronEmits {
  'update:modelValue': [value: string]
  change: [value: string]
  error: [issue: CronIssue]
}
export interface CronMessages {
  fields: Record<CronField, string>
  modes: Record<CronMode, string>
  errors: Record<CronErrorCode, string>
  start: string
  end: string
  interval: string
  next: string
  restricted: string
  expression: string
}
export interface CronProps {
  modelValue?: string
  format?: CronFormat
  fields?: readonly CronField[]
  options?: CronOptions
  disabled?: boolean
  locale?: 'en' | 'zh-CN'
  messages?: Partial<Omit<CronMessages, 'fields' | 'modes' | 'errors'>> & {
    fields?: Partial<CronMessages['fields']>
    modes?: Partial<CronMessages['modes']>
    errors?: Partial<CronMessages['errors']>
  }
  /** 用于预览下次执行时间的 IANA 时区；默认为浏览器时区。 */
  timeZone?: string
  /** 显示的下次执行时间数量；设为 0 可隐藏预览。 */
  previewCount?: number
}
