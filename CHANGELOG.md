# Changelog

变更日志

All notable changes to this project will be documented in this file.

项目中的所有重要变更都会记录在此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)。

## [2.1.2] - 2026-02-20

### Fixed / 修复
- `fix(argument)`: Normalize `globalThis.$argument` and guard `null`; 标准化 `globalThis.$argument` 并处理 `null` 场景（`c475e76`）。
- `fix(getStorage)`: Include `$argument` in merge flow with conditional handling; 修复合并流程以包含 `$argument` 并增加条件控制（`3a1c8bb`）。
- `fix(getStorage)`: Add merge source control by `$argument.Storage`; 支持通过 `$argument.Storage` 控制合并来源（`8a59892`）。
- `fix(getStorage)`: Replace `BoxJs` merge source naming/usage with `PersistentStore`; 将合并来源命名/实现统一为 `PersistentStore`（`5fa69e4`）。
- `fix(Storage)`: Add Surge `removeItem` support via `$persistentStore.write(null, keyName)`; 为 Surge 增加 `removeItem` 删除支持（`23ebecb`）。

### Changed / 变更
- `refactor(getStorage)`: Rename `Store` to `Root` and align debug output; 重命名 `Store` 为 `Root` 并同步调试输出字段（`570a75c`）。

### Docs / 文档
- Sync README/JSDoc with recent behavior changes for `argument` / `getStorage` / `Storage`; 同步 `argument` / `getStorage` / `Storage` 的 README 与 JSDoc 说明（`2b13601`）。

[2.1.2]: https://github.com/NSNanoCat/util/compare/main...dev
