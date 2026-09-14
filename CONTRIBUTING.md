# 贡献指南

请使用 Node.js 22 和 pnpm 10.7.1。

```sh
pnpm install --frozen-lockfile
pnpm test:dev
pnpm pack
```

代码变更应补充必要的行为测试，并同步维护中英文 README。npm 发布不会由 GitHub Actions 自动执行，请按照项目中的手动发布流程操作。
