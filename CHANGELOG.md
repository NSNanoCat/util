# Changelog

变更日志

All notable changes to this project will be documented in this file.

项目中的所有重要变更都会记录在此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)。

## [2.1.4] - 2026-02-20

### Fixed / 修复
- `fix(getStorage)`: Accept lowercase `boxjs` as alias for `BoxJs`; 支持小写别名 `boxjs`。（`45f5cd8`）
- `fix(getStorage)`: Treat undefined `$argument.Storage` the same as `PersistentStore`; 将未定义的 `.Storage` 视为 `PersistentStore` 并更新文档。（`99869a0`）

### Docs / 文档
- `docs(getStorage)`: Update README/JSDoc to mention undefined `.Storage` defaulting and adjust import example; 在 README/JSDoc 中说明当 `$argument.Storage` 未定义时视为 `PersistentStore`，并修正导入示例。

## [2.1.3] - 2026-02-20

### Docs / 文档
- `docs(getStorage)`: clarify Settings/Configs/Caches merge; update JSDoc/README/CHANGELOG (commit 6bccb00)。

## [2.1.2] - 2026-02-20

### Fixed / 修复
- `fix(argument)`: Normalize `globalThis.$argument` and guard `null`; 标准化 `globalThis.$argument` 并处理 `null` 场景（`c475e76`）。
- `fix(getStorage)`: Include `$argument` in merge flow with conditional handling; 修复合并流程以包含 `$argument` 并增加条件控制（`3a1c8bb`）。
- `fix(getStorage)`: Add merge source control by `$argument.Storage`; 支持通过 `$argument.Storage` 控制合并来源（`8a59892`）。
- `fix(getStorage)`: Replace `BoxJs` merge source naming/usage with `PersistentStore`; 将合并来源命名/实现统一为 `PersistentStore`（`5fa69e4`）。
- `fix(Storage)`: Add Surge `removeItem` support via `$persistentStore.write(null, keyName)`; 为 Surge 增加 `removeItem` 删除支持（`23ebecb`）。

### Changed / 变更
- `refactor(getStorage)`: Rename `Store` to `Root` and align debug output; 重命名 `Store` 为 `Root` 并同步调试输出字段（`570a75c`）。
- `refactor(getStorage)`: Centralize `Settings` merge controlled by `$argument.Storage`; ensure `Configs`/`Caches` are merged per-profile (`names`)（`17747ae`）。
- `refactor(getStorage)`: switch to a default export instead of named; 改用默认导出（`export default`）。

### Docs / 文档
- Sync README/JSDoc with recent behavior changes for `argument` / `getStorage` / `Storage`; 同步 `argument` / `getStorage` / `Storage` 的 README 与 JSDoc 说明（`2b13601`）。
- `docs(getStorage)`: Document aliases for `$argument.Storage` (`Argument` / `$argument`, `PersistentStore` / `BoxJs` / `$persistentStore`) and correct merge-order in README/JSDoc; 为 `$argument.Storage` 增加别名说明并修正 README 中的合并顺序说明。
- `docs(getStorage)`: Update import example and JSDoc to reflect default export; 更新导入示例及 JSDoc 以反映默认导出变更。

## [2.1.1] - 2026-02-20

### Changed / 变更
- `refactor(getStorage)`: remove default export and clarify usage boundaries; 改为无默认导出并补充使用边界说明（`4105cf2`）。
- `feat(index)`: re-export `getStorage` from entry point and update docs/tests; 从入口导出并更新文档/测试（`b0a1bd9`）。

### Docs / 文档
- `docs`: improve installation/update guidance for newcomers; 优化安装与更新指引面向新手（`ce7c81a`）。
- `docs`: enhance polyfill descriptions and links; 完善 polyfill 文档说明与引用链接（`b817c07`）。
- `docs`: fill out README and JSDoc comments; 补充 README 与 JSDoc 注释说明（`5c5f1f3`）。





[2.1.4]: https://github.com/NSNanoCat/util/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/NSNanoCat/util/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/NSNanoCat/util/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/NSNanoCat/util/compare/v2.1.0...v2.1.1

