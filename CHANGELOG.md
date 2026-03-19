# 变更日志

项目中的所有重要变更都会记录在此文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)。

## [2.5.2] - 2026-03-19

### 变更
- `refactor(types)`: 统一 `polyfill` 类型声明为单一来源，`types/modules` 改为引用 `polyfill/*.d.ts` 进行根入口适配，避免重复维护。
- `refactor(types)`: 拆分 `types/modules/Lodash.d.ts` 与 `types/modules/qs.d.ts`，并保留 `polyfills` 聚合入口以兼容既有导入方式。

### 文档
- `docs(types)`: 为 `polyfill/Console.d.ts`、`polyfill/Lodash.d.ts`、`polyfill/qs.d.ts`、`polyfill/StatusTexts.d.ts`、`polyfill/Storage.d.ts` 补充中英双语 JSDoc。

## [2.5.1] - 2026-03-19

### 变更
- `chore(fetch)`: 补充 `polyfill/fetch.mts` 与 `polyfill/fetch.d.ts`，完善 `fetch` 子路径导入的类型支持。

## [2.5.0] - 2026-03-18

### 变更
- `chore(KV)`: 移除 `KV` 相关实现、测试、类型和文档说明。

### 文档
- `docs(KV)`: 保留历史日志，仅删除 `KV` 新增内容；如有需求请改用 [Auraflare/shared](https://github.com/Auraflare/shared)。

## [2.4.0] - 2026-03-13

### 新增
- `feat(qs)`: 新增 `polyfill/qs.mjs`，提供 `qs.parse()` 与 `qs.stringify()` 查询字符串工具。
- `test(qs)`: 增加 `qs` 回归测试，覆盖字符串、对象、空值与序列化路径场景。

### 变更
- `refactor(argument)`: 将 `$argument` 标准化逻辑迁移到 `qs.parse()`，`lib/argument.mjs` 改为统一委托 `qs.parse(globalThis.$argument)`。
- `refactor(index)`: 从主入口与 `polyfill/index.js` 导出 `qs`。

### 文档
- `docs(qs)`: 更新 README 与变更日志，补充 `qs` 模块导出、依赖关系与 API 说明。

## [2.3.1] - 2026-03-13

### 变更
- `refactor(KV)`: 移除 `KV` 内部的 `#getNamespace()` 私有方法，Worker 分支直接调用实例上的 namespace binding，不再做额外检测。

### 文档
- `docs(KV)`: 补充本次 `KV` 内部实现调整的版本记录。

## [2.3.0] - 2026-03-13

### 新增
- `feat(app)`: 为 `$app` 增加 `Worker` 运行时类型，并以 `Cloudflare` 全局标记识别 Worker。
- `feat(environment)`: 为 `environment()` 增加 `Worker` 环境对象输出。
- `feat(KV)`: 新增基于 Cloudflare Workers KV namespace binding 的异步 `KV` 适配器，并从主入口导出。
- `feat(KV)`: 为 `KV` 补充 `list()` 方法，并对齐 Cloudflare Workers KV 的原生列举返回结构。
- `test(app)`: 增加 Worker 运行时识别回归测试。
- `test(KV)`: 增加 `KV` 在 Worker 与非 Worker 平台下的行为回归测试。

### 变更
- `refactor(done)`: 为 Worker 增加独立结束分支，仅记录日志，不调用 `$done` 或退出进程。
- `refactor(fetch)`: 为 Worker 接入与 Node.js 并列的 `fetch` 分支，并同步超时与返回结构说明。
- `refactor(Storage)`: 为 Worker 增加基于内存缓存的 `getItem` / `setItem` / `removeItem` / `clear` 支持。
- `refactor(Console)`: 将 Worker 纳入 `Console.error` 的栈输出分支。
- `refactor(notification)`: 将 Worker 纳入非 iOS 通知日志分支。
- `refactor(types)`: 将 `types/nsnanocat-util.d.ts` 拆分为单入口加多模块声明文件，保持现有 `types` 入口不变。

### 文档
- `docs`: 同步 README、JSDoc、类型声明与变更日志，反映 Worker 运行时支持、`KV` 适配器与版本号更新。

## [2.2.3] - 2026-03-08

### 修复
- `fix(fetch)`: 增加对特定平台的超时参数处理，确保毫秒级超时兼容性（`9a13625`）。
- `fix(biome)`: 更新 Biome schema 版本并调整文件包含规则（`01e8422`）。

### 变更
- `fix(deps)`: 添加 `@biomejs/biome` 依赖并更新 `pnpm-lock.yaml`（`4a395b7`）。

## [2.2.0] - 2026-03-06

### 修复
- `fix(fetch)`: 统一 `fetch` 默认超时为 5 秒，兼容秒/毫秒输入，并为 Quantumult X / Loon / Node.js 正确转换超时单位（`5103305`, `93508a0`, `3433b58`）。
- `fix(fetch)`: 通过 `globalThis` 访问 `$httpClient` / `$task` / `fetch`，修复 `fetch-cookie` 导入并完善 Node.js 回退逻辑，提升跨运行时兼容性（`1c4fa1c`, `f305091`, `3283f2d`, `c56dc65`）。
- `fix(fetch)`: Node.js 分支默认启用 Cookie 支持，并允许通过 `auto-cookie` 显式关闭（`03f9a19`, `779a1c1`）。

### 变更
- `refactor(app)`: 调整 `$app` 识别顺序，优先脚本平台标记并改用 `process.versions.node` 判断 Node.js，避免在 Workers / Vercel 风格运行时误判（`a8e246b`, `b974c7a`）。
- `fix(done)`: 未识别平台不再默认 `process.exit(1)`，仅 Node.js 分支显式退出进程（`b974c7a`）。

### 新增
- `test(app)`: 新增 Node.js 平台识别回归测试，覆盖 Cloudflare 风格与类 Web API 全局变量场景（`b974c7a`）。

### 文档
- 同步 README、声明注释与变更日志，反映最新的 `$app` 与 `fetch` 行为。

## [2.1.6] - 2026-02-24

### 修复
- `fix(Storage)`: 完善 Node.js 环境下 `removeItem` / `clear` 方法（`47de721`）。

### 新增
- `feat(getStorage)`: 导出 `getStorage` 辅助函数并同步类型定义与文档（`ccd91f3`）。

### 变更
- `refactor(getStorage)`: 重命名 `string2array` 为 `value2array`，并将解析逻辑调整为 `switch` 语法（`4628920`）。

## [2.1.5] - 2026-02-21

### 变更
- `chore(types)`: 新增本地类型声明并发布类型入口（`3071c12`）。

### 文档
- `docs`: 更新 changelog 顺序并反映导出变更（`5a5994a`）。

## [2.1.4] - 2026-02-20

### 修复
- `fix(getStorage)`: 支持小写别名 `boxjs`（`45f5cd8`）。
- `fix(getStorage)`: 将未定义的 `$argument.Storage` 视为 `PersistentStore` 并同步文档（`99869a0`）。

### 文档
- `docs(getStorage)`: 在 README/JSDoc 中说明 `$argument.Storage` 未定义时视为 `PersistentStore`，并修正导入示例。

## [2.1.3] - 2026-02-20

### 文档
- `docs(getStorage)`: 说明 `Settings` / `Configs` / `Caches` 的合并逻辑，并同步 README、JSDoc 与 CHANGELOG（`6bccb00`）。

## [2.1.2] - 2026-02-20

### 修复
- `fix(argument)`: 标准化 `globalThis.$argument` 并处理 `null` 场景（`c475e76`）。
- `fix(getStorage)`: 修复合并流程以包含 `$argument` 并增加条件控制（`3a1c8bb`）。
- `fix(getStorage)`: 支持通过 `$argument.Storage` 控制合并来源（`8a59892`）。
- `fix(getStorage)`: 将合并来源命名与实现统一为 `PersistentStore`（`5fa69e4`）。
- `fix(Storage)`: 为 Surge 增加 `removeItem` 删除支持（`23ebecb`）。

### 变更
- `refactor(getStorage)`: 重命名 `Store` 为 `Root` 并同步调试输出字段（`570a75c`）。
- `refactor(getStorage)`: 将 `Settings` 合并逻辑统一交由 `$argument.Storage` 控制，并确保 `Configs` / `Caches` 按配置名（`names`）合并（`17747ae`）。
- `refactor(getStorage)`: 改用默认导出（`export default`）。

### 文档
- 同步 `argument` / `getStorage` / `Storage` 的 README 与 JSDoc 说明（`2b13601`）。
- `docs(getStorage)`: 为 `$argument.Storage` 增加别名说明，并修正 README/JSDoc 中的合并顺序说明。
- `docs(getStorage)`: 更新导入示例及 JSDoc 以反映默认导出变更。

## [2.1.1] - 2026-02-20

### 变更
- `refactor(getStorage)`: 移除 `getStorage` 默认导出并补充使用边界说明（`4105cf2`）。
- `feat(index)`: 从入口导出 `getStorage` 并同步文档与测试（`b0a1bd9`）。

### 文档
- `docs`: 面向新手优化安装与更新指引（`ce7c81a`）。
- `docs`: 完善 polyfill 文档说明与引用链接（`b817c07`）。
- `docs`: 补充 README 与 JSDoc 注释说明（`5c5f1f3`）。

[2.5.2]: https://github.com/NSNanoCat/util/compare/v2.5.1...HEAD
[2.5.1]: https://github.com/NSNanoCat/util/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/NSNanoCat/util/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/NSNanoCat/util/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/NSNanoCat/util/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/NSNanoCat/util/compare/v2.2.3...v2.3.0
[2.2.3]: https://github.com/NSNanoCat/util/compare/v2.2.0...v2.2.3
[2.2.0]: https://github.com/NSNanoCat/util/compare/v2.1.7...v2.2.0
[2.1.6]: https://github.com/NSNanoCat/util/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/NSNanoCat/util/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/NSNanoCat/util/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/NSNanoCat/util/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/NSNanoCat/util/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/NSNanoCat/util/compare/v2.1.0...v2.1.1
