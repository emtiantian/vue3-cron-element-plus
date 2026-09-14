<script setup lang="ts">
import { ref } from 'vue'
import { VCron, defaultExpression } from '../src'
import type { CronFormat } from '../src'
const format = ref<CronFormat>('unix-seconds'),
  expression = ref('0 * * * * *'),
  locale = ref<'en' | 'zh-CN'>('zh-CN'),
  limited = ref(false)
</script>
<template>
  <main>
    <small>@emtt / Vue 组件</small>
    <h1>Cron 表达式编辑器</h1>
    <p>选择时间规则，预览执行计划。支持按需配置字段与编辑选项。</p>
    <div class="controls">
      <label
        >表达式格式
        <select v-model="format" @change="expression = defaultExpression(format)">
          <option>unix</option>
          <option>unix-seconds</option>
          <option>quartz</option>
        </select></label
      ><label
        >语言
        <select v-model="locale">
          <option>en</option>
          <option>zh-CN</option>
        </select></label
      ><label><input v-model="limited" type="checkbox" /> 仅显示分钟与小时</label>
    </div>
    <VCron
      v-model="expression"
      :format="format"
      :locale="locale"
      :fields="limited ? ['minute', 'hour'] : undefined"
      :options="
        limited ? { minute: ['step', 'specific'], hour: ['all', 'range', 'specific'] } : undefined
      "
      time-zone="Asia/Shanghai"
    /><label class="external">表达式回显 <input v-model="expression" /></label>
    <p>预览时区：Asia/Shanghai · 星期日编号：Quartz 为 1，Unix 为 0 或 7。</p>
  </main>
</template>
<style>
body {
  margin: 0;
  background: #f4f6fa;
  color: #233047;
  font: 15px/1.6 system-ui;
}
main {
  max-width: 800px;
  margin: 32px auto;
  padding: 24px;
}
small {
  color: #5969b3;
  font-weight: 700;
  letter-spacing: 2px;
}
h1 {
  font-size: 30px;
  margin: 14px 0;
}
p {
  color: #64748b;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 28px 0;
}
.controls select,
.controls input,
.external input {
  font: inherit;
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.external {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  align-items: center;
}
.external input {
  flex: 1;
  min-width: 0;
}
</style>
