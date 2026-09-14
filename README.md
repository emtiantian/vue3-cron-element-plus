# @emtt/vue3-cron-element-plus

[简体中文](README.zh-CN.md)

[Live demo](https://emtiantian.github.io/vue3-cron-element-plus/)

![Cron editor preview](https://raw.githubusercontent.com/emtiantian/vue3-cron-element-plus/master/docs/preview.png)

An Element Plus cron editor for Vue 3 projects that need configurable fields and editing modes.

## Features

- **Two configuration layers**: choose editable fields and allowed modes per field.
- **Three formats**: Unix five-field, Unix with seconds, and Quartz six-field, with distinct day/weekday semantics.
- **Value preservation**: hidden fields keep their values; invalid or unsupported external expressions are never silently rewritten.
- **Integration**: v-model, TypeScript types, English/Chinese messages, overrides, and timezone-aware previews.
- **On-demand dependencies**: Vue and Element Plus are peers; only used components and their styles are imported.

## Quick start

Version 0.1.0 is being prepared. The registry install command becomes available after publication. The live demo is available at the link above.

```sh
pnpm add @emtt/vue3-cron-element-plus vue element-plus
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VCron } from '@emtt/vue3-cron-element-plus'
import '@emtt/vue3-cron-element-plus/style.css'
const expression = ref('0 * * * * *')
</script>

<template>
  <VCron v-model="expression" />
</template>
```

No global Element Plus registration is needed. Import `@emtt/vue3-cron-element-plus/style.css` once in your application entry. It includes the required Element Plus styles and this editor's layout. The JavaScript entry does not automatically import CSS.

## Configuration example

Initialize expression to a valid Quartz value, such as `0 0/5 * * * ?`, first.

```vue
<VCron
  v-model="expression"
  format="quartz"
  :fields="['minute', 'hour']"
  :options="{ minute: ['step', 'specific'], hour: ['all', 'range', 'specific'] }"
  locale="zh-CN"
  time-zone="Asia/Shanghai"
  :messages="{ next: 'Upcoming runs' }"
/>
```

## API

| Prop           | Type                                     | Default / 默认值                           |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| `modelValue`   | `string`                                 | Format default / 格式默认值                |
| `format`       | `unix / unix-seconds / quartz`           | `unix-seconds`                             |
| `fields`       | `CronField[]`                            | All format fields / 当前格式全部字段       |
| `options`      | `Partial<Record<CronField, CronMode[]>>` | All supported editors / 全部支持的编辑区域 |
| `disabled`     | `boolean`                                | `false`                                    |
| `locale`       | `en / zh-CN`                             | `zh-CN`                                    |
| `messages`     | Partial messages / 部分文案              | —                                          |
| `timeZone`     | IANA timezone / 时区                     | Host timezone / 运行环境时区               |
| `previewCount` | Integer 0–20 / 整数                      | `3`; `0` disables preview / 关闭预览       |

Events: `update:modelValue` and `change` carry the new valid expression; `error` carries `{ code, field? }` and may fire at initialization. Invalid edits remain in the UI until corrected; they do not update v-model.

Exports: `VCron`, `en`, `zhCN`, `parseExpression`, `serializeExpression`, `nextSchedules`, `defaultExpression`, `validateConfig`, `CronError`, and public types.

## Cron formats

| Format         | Default       | Sunday |
| -------------- | ------------- | ------ |
| `unix`         | `* * * * *`   | 0 / 7  |
| `unix-seconds` | `0 * * * * *` | 0 / 7  |
| `quartz`       | `0 * * * * ?` | 1      |

Unix uses OR when both day-of-month and weekday are restricted. Quartz requires exactly one `?`; editing day or weekday adjusts its counterpart, including a hidden counterpart.

fields must contain at least one unique field. Configured mode arrays must be nonempty and supported by the format. `none` is exclusive to Quartz day/weekday. Default modes are `all`, `step`, `range`, `specific`, plus `none` where supported. Field names are second, minute, hour, day, month, week. External values with a disabled mode are preserved with a notice; selecting an enabled mode makes them editable. Changing format does not convert a supplied v-model: update the expression to match it.

## Scope and limitations

Supports `*`, numbers, numeric lists, ascending ranges, and steps starting from a number or `*`. No year, `L/W/#`, named months/weekdays, range steps, or mixed lists. Expressions outside the editor subset are preserved with an error. Weekdays are displayed numerically; see the table above.

This component does not execute jobs. Previews use cron-parser and the host timezone unless overridden. Preview failure does not necessarily imply invalid string syntax (an impossible calendar date is one example). Previews recalculate when relevant values change, without a background refresh timer. Modern ESM bundlers are supported; SSR is not verified.

## Development and demo

Run `pnpm install` then `pnpm dev`. The playground covers formats, language, two-layer configuration, and external v-model updates. The online GitHub Pages demo is available at the link above.

Customize `--cron-padding`, `--cron-radius`, and Element Plus CSS variables.

## Maintenance

[Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [MIT](LICENSE) · [Author](https://github.com/emtiantian)

Configured interval, range and specific-value editors are always visible; editing activates that rule. Select all is inside the specific-values section; unchecking clears the selection. Empty selections show a validation message and do not emit invalid expressions. The component defaults to Simplified Chinese.

The default format is unix-seconds. Seconds show interval and specific values by default, overridable with options. Use format="unix" for five fields. Select all is built into specific values; a complete selection emits *.
