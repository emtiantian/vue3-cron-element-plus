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
/** Events emitted by VCron. */
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
  /** IANA timezone used for next-run previews; defaults to the browser timezone. */
  timeZone?: string
  /** Number of next-run times to display. Set to 0 to hide the preview. */
  previewCount?: number
}
