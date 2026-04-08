# @nsnanocat/util

用于统一 Quantumult X / Loon / Shadowrocket / Worker / Node.js / Egern / Surge / Stash 脚本接口的通用工具库。

核心目标：
- 统一不同平台的 HTTP、通知、持久化、结束脚本等调用方式。
- 在一个脚本里尽量少写平台分支。
 - 提供一组可直接复用的 polyfill（`fetch` / `Storage` / `Console` / `Lodash` / `qs`）。

## 目录
- [安装与导入](#安装与导入)
- [导出清单](#导出清单)
- [模块依赖关系](#模块依赖关系)
- [API 参考（按 mjs 文件）](#api-参考按-mjs-文件)
- [平台差异总览](#平台差异总览)
- [已知限制与注意事项](#已知限制与注意事项)
- [参考资料](#参考资料)

## 安装与导入

发布源：
- npm（推荐）：[https://www.npmjs.com/package/@nsnanocat/util](https://www.npmjs.com/package/@nsnanocat/util)
- GitHub Packages（同步发布）：[https://github.com/NSNanoCat/util/pkgs/npm/util](https://github.com/NSNanoCat/util/pkgs/npm/util)

如果你不确定该选哪个，直接用 npm 源即可。
如果你从 GitHub Packages 安装，需要先配置 GitHub 认证（PAT Token）。

### 1) 使用 npm 源（推荐，最省事）

```bash
# 首次安装：拉取并安装这个包
npm i @nsnanocat/util

# 更新到最新版本：升级已安装的 util
npm i @nsnanocat/util@latest
# 你也可以使用 update（效果类似）
# npm update @nsnanocat/util
```

### 2) 使用 GitHub Packages 源（同步源，需要 GitHub 鉴权）

```bash
# 把 @nsnanocat 作用域的包下载源切到 GitHub Packages
npm config set @nsnanocat:registry https://npm.pkg.github.com

# 配置 GitHub Token（用于下载 GitHub Packages）
# 建议把 YOUR_GITHUB_PAT 换成你的真实 Token，再执行
# echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT" >> ~/.npmrc

# 首次安装：从 GitHub Packages 安装 util
npm i @nsnanocat/util

# 更新到最新版本：从 GitHub Packages 拉取最新 util
npm i @nsnanocat/util@latest
```

```js
import {
  $app,       // 当前平台名（如 "Surge" / "Loon" / "Quantumult X" / "Worker" / "Node.js"）
  $argument,  // 已标准化的模块参数对象（导入包时自动处理字符串 -> 对象）
  done,       // 统一结束脚本函数（内部自动适配各平台 $done 差异）
  fetch,      // 统一 HTTP 请求函数（内部自动适配 $httpClient / $task / fetch）
  notification, // 统一通知函数（内部自动适配 $notify / $notification.post）
  time,       // 时间格式化工具
  wait,       // 延时等待工具（Promise）
  Console,    // 统一日志工具（支持 logLevel）
  Lodash as _, // Lodash 建议按官方示例惯例使用 `_` 作为工具对象别名
  qs,         // 查询字符串工具（parse / stringify）
  Storage,    // 统一持久化存储接口（适配 $prefs / $persistentStore / 内存 / 文件）
} from "@nsnanocat/util";
```

## 导出清单

### 包主入口（`index.js`）已导出
- `lib/app.mjs`
- `lib/argument.mjs`（`$argument` 参数标准化模块，导入时自动执行）
- `lib/done.mjs`
- `lib/notification.mjs`
- `lib/time.mjs`
- `lib/wait.mjs`
- `polyfill/Console.mjs`
- `polyfill/fetch.mjs`
- `polyfill/Lodash.mjs`
- `polyfill/qs.mjs`
- `polyfill/StatusTexts.mjs`
- `polyfill/Storage.mjs`

### 仓库中存在但未从主入口导出
- `lib/environment.mjs`
- `lib/runScript.mjs`
- `getStorage.mjs`（薯条项目自用，仅当你的存储结构与薯条项目一致时再使用；请通过子路径 `@nsnanocat/util/getStorage.mjs` 导入）
- `polyfill/Storage.cjs`（Node.js / Worker CJS 入口；请通过子路径 `@nsnanocat/util/polyfill/Storage` 导入）

## 模块依赖关系

说明：
- 下表只描述“模块之间”的依赖关系、调用到的函数/常量、以及依赖原因。
- 你在业务脚本中通常只需要调用对外 API；底层跨平台差异已在这些依赖链里处理。

| 模块 | 依赖模块 | 使用的函数/常量 | 为什么依赖 |
| --- | --- | --- | --- |
| `lib/app.mjs` | 无 | 无 | 核心平台识别源头，供其他差异模块分流 |
| `lib/environment.mjs` | `lib/app.mjs` | `$app` | 按平台生成统一 `$environment`（尤其补齐 `app` 字段） |
| `lib/argument.mjs` | `polyfill/Console.mjs`, `polyfill/qs.mjs` | `Console.debug`, `Console.logLevel`, `qs.parse` | 统一 `$argument` 结构，并委托 `qs.parse` 处理字符串/对象/空值输入 |
| `lib/done.mjs` | `lib/app.mjs`, `polyfill/Console.mjs`, `polyfill/Lodash.mjs`, `polyfill/StatusTexts.mjs` | `$app`, `Console.log`, `Lodash.set`, `Lodash.pick`, `StatusTexts` | 将各平台 `$done` 参数格式拉平并兼容状态码/策略字段 |
| `lib/notification.mjs` | `lib/app.mjs`, `polyfill/Console.mjs` | `$app`, `Console.group`, `Console.log`, `Console.groupEnd`, `Console.error` | 将通知参数映射到各平台通知接口并统一日志输出 |
| `lib/runScript.mjs` | `polyfill/Console.mjs`, `polyfill/fetch.mjs`, `polyfill/Storage.mjs`, `polyfill/Lodash.mjs` | `Console.error`, `fetch`, `Storage.getItem`（`Lodash` 当前版本未实际调用） | 读取 BoxJS 配置并发起统一 HTTP 调用执行脚本 |
| `getStorage.mjs` | `lib/argument.mjs`, `polyfill/Console.mjs`, `polyfill/Lodash.mjs`, `polyfill/Storage.mjs` | `Console.debug`, `Console.logLevel`, `Lodash.merge`, `Storage.getItem` | 先标准化 `$argument`，再合并默认配置/持久化配置/运行参数 |
| `polyfill/Console.mjs` | `lib/app.mjs` | `$app` | 日志在 Worker / Node.js 与 iOS 脚本环境使用不同错误输出策略 |
| `polyfill/fetch.mjs` | `lib/app.mjs`, `polyfill/Lodash.mjs`, `polyfill/StatusTexts.mjs`, `polyfill/Console.mjs` | `$app`, `Lodash.set`, `StatusTexts`（`Console` 当前版本未实际调用） | 按平台选请求引擎并做参数映射、响应结构统一 |
| `polyfill/Storage.mjs` | `lib/app.mjs`, `polyfill/Lodash.mjs` | `$app`, `Lodash.get`, `Lodash.set`, `Lodash.unset` | ESM 路径下按平台选持久化后端并支持 `@key.path` 读写（Node.js 请走 `Storage.cjs`） |
| `polyfill/Lodash.mjs` | 无 | 无 | 提供路径/合并等基础能力，被多个模块复用 |
| `polyfill/qs.mjs` | `polyfill/Lodash.mjs` | `Lodash.get`, `Lodash.set`, `Lodash.toPath` | 提供查询字符串与对象之间的解析/序列化能力 |
| `polyfill/StatusTexts.mjs` | 无 | 无 | 提供 HTTP 状态文案，供 `fetch/done` 使用 |
| `index.js` / `lib/index.js` / `polyfill/index.js` | 多个模块 | `export *` | 聚合导出，不含业务逻辑 |

## API 参考（按 mjs 文件）

### `lib/app.mjs` 与 `lib/environment.mjs`（平台识别与环境）

#### `$app`
- 类型：`"Quantumult X" | "Loon" | "Shadowrocket" | "Egern" | "Surge" | "Stash" | "Worker" | "Node.js" | undefined`
- 角色：核心模块。库内所有存在平台行为差异的模块都会先读取 `$app` 再分流（如 `done`、`notification`、`fetch`、`Storage`、`Console`、`environment`）。
- 读取方式：

```js
import { $app } from "@nsnanocat/util";
const appName = $app; // 读取 $app，返回平台字符串
console.log(appName);
```

- 识别顺序（`lib/app.mjs`）：
1. 存在 `$task` -> `Quantumult X`
2. 存在 `$loon` -> `Loon`
3. 存在 `$rocket` -> `Shadowrocket`
4. 存在 `Egern` -> `Egern`
5. 存在 `$environment` 且有 `surge-version` -> `Surge`
6. 存在 `$environment` 且有 `stash-version` -> `Stash`
7. 存在 `Cloudflare` -> `Worker`
8. 存在 `process.versions.node` -> `Node.js`
9. 默认回落 -> `undefined`
- 实现细节：内部使用 `'key' in globalThis` 检测平台标记，避免 `Object.keys(globalThis)` 漏掉不可枚举全局变量；当前 Worker 识别以 `Cloudflare` 全局标记为准。

#### `$environment` / `environment()`
- 路径：`lib/environment.mjs`（未从包主入口导出）
- 签名：`environment(): object`
- 调用方式：

```js
import { $environment, environment } from "@nsnanocat/util/lib/environment.mjs";
console.log($environment.app); // 统一平台名
console.log(environment()); // 当前环境对象
```

- 规则：会为已识别平台统一生成 `$environment.app = "平台名称"`。

| 平台 | 调用路径（读取来源） | 读取结果示例 |
| --- | --- | --- |
| Surge | 读取全局 `$environment`，再写入 `app` | `{ ..., "surge-version": "x", app: "Surge" }` |
| Stash | 读取全局 `$environment`，再写入 `app` | `{ ..., "stash-version": "x", app: "Stash" }` |
| Egern | 读取全局 `$environment`，再写入 `app` | `{ ..., app: "Egern" }` |
| Loon | 读取全局 `$loon` 字符串并拆分 | `{ device, ios, "loon-version", app: "Loon" }` |
| Quantumult X | 不读取额外环境字段，直接构造对象 | `{ app: "Quantumult X" }` |
| Worker | 直接构造对象 | `{ app: "Worker" }` |
| Node.js | 读取 `process.env` 并写入 `process.env.app` | `{ ..., app: "Node.js" }` |
| 其他 | 无 | `{}` |

### `lib/argument.mjs`（`$argument` 参数标准化模块）

此文件无显式导出；`import` 后立即执行。这是为了统一各平台 `$argument` 的输入差异。

#### 行为
- 通过包入口导入（`import ... from "@nsnanocat/util"`）时会自动执行本模块。
- JSCore 环境不支持 `await import`，请使用静态导入或直接走包入口导入。
- 读取到的 `$argument` 会按 URL Params 样式格式化为对象，并支持深路径。
- 内部实现统一委托给 `qs.parse(globalThis.$argument)`。
- 你也可以通过 `import { $argument } from "@nsnanocat/util"` 读取当前已标准化的 `$argument` 快照。
- 平台输入差异说明：
  - Surge / Stash / Egern：脚本参数通常以字符串形式传入（如 `a=1&b=2`）。
  - Loon：支持字符串和对象两种 `$argument` 形式。
  - Quantumult X / Shadowrocket：不提供 `$argument`。
- 当全局 `$argument` 为 `string`（如 `"a.b=1&x=2"`）时：
  - 按 `&` / `=` 切分。
  - 去掉值中的双引号。
  - 使用点路径展开对象（`a.b=1 -> { a: { b: "1" } }`）。
- 当全局 `$argument` 为 `object` 时：
  - 将 key 当路径写回新对象（`{"a.b":"1"}` -> `{a:{b:"1"}}`）。
- 当 `$argument` 为 `null` 或 `undefined`：会归一化为 `{}`。
- 若 `$argument.LogLevel` 存在：同步到 `Console.logLevel`。

#### 用法
```js
import { $argument } from "@nsnanocat/util";

// $argument = "mode=on&a.b=1"; // 示例入参，实际由模块参数注入
console.log($argument); // { mode: "on", a: { b: "1" } }
```

### `lib/done.mjs`

#### `done(object = {})`
- 签名：`done(object?: object): void`
- 作用：统一不同平台的脚本结束接口（`$done` / Worker 日志结束 / Node 退出）。

说明：下表描述的是各 App 原生接口差异与本库内部映射逻辑。调用方只需要按 `done` 的统一参数传值即可，不需要自己再写平台分支。

支持字段（输入）：
- `status`: `number | string`
- `url`: `string`
- `headers`: `object`
- `body`: `string | ArrayBuffer | TypedArray`
- `bodyBytes`: `ArrayBuffer`
- `policy`: `string`

平台行为差异：

| 平台 | `policy` 处理 | `status` 处理 | `body/bodyBytes` 处理 | 最终行为 |
| --- | --- | --- | --- | --- |
| Surge | 写入 `headers.X-Surge-Policy` | 透传 | 透传 | `$done(object)` |
| Loon | `object.node = policy` | 透传 | 透传 | `$done(object)` |
| Stash | 写入 `headers.X-Stash-Selected-Proxy`（URL 编码） | 透传 | 透传 | `$done(object)` |
| Egern | 不转换 | 透传 | 透传 | `$done(object)` |
| Shadowrocket | 不转换 | 透传 | 透传 | `$done(object)` |
| Quantumult X | 写入 `opts.policy` | `number` 会转 `HTTP/1.1 200 OK` 字符串 | 仅保留 `status/url/headers/body/bodyBytes`；`ArrayBuffer/TypedArray` 转 `bodyBytes` | `$done(object)` |
| Worker | 不适用 | 不适用 | 不适用 | 仅记录结束日志 |
| Node.js | 不适用 | 不适用 | 不适用 | `process.exit(1)` |

不可用/差异点：
- `policy` 在 Egern / Shadowrocket 分支不做映射。
- Quantumult X 会丢弃未在白名单内的字段。
- Quantumult X 的 `status` 在部分场景要求完整状态行（如 `HTTP/1.1 200 OK`），本库会在传入数字状态码时自动拼接（依赖 `StatusTexts`）。
- Worker 不调用 `$done`，仅记录结束日志。
- Node.js 不调用 `$done`，而是直接退出进程，且退出码固定为 `1`。
- 未识别平台（`$app === undefined`）只记录结束日志，不会尝试调用 `$done` 或退出进程。

### `lib/notification.mjs`

#### `notification(title, subtitle, body, content)`
- 签名：
  - `title?: string`
  - `subtitle?: string`
  - `body?: string`
  - `content?: string | number | boolean | object`
- 默认值：`title = "ℹ️ ${$app} 通知"`
- 作用：统一 `notify/notification` 参数格式并发送通知。

`content` 可用 key（对象形式）：
- 跳转：`open` / `open-url` / `url` / `openUrl`
- 复制：`copy` / `update-pasteboard` / `updatePasteboard`
- 媒体：`media` / `media-url` / `mediaUrl`
- 其他：`auto-dismiss`、`sound`、`mime`

平台映射：

| 平台 | 调用接口 | 字符串 `content` 行为 | 对象字段支持 |
| --- | --- | --- | --- |
| Surge | `$notification.post` | `{ url: content }` | `open-url`/`clipboard` 动作、`media-url`、`media-base64`、`auto-dismiss`、`sound` |
| Stash | `$notification.post` | `{ url: content }` | 同 Surge 分支（是否全部展示取决于 Stash 支持） |
| Egern | `$notification.post` | `{ url: content }` | 同 Surge 分支（是否全部展示取决于 Egern 支持） |
| Shadowrocket | `$notification.post` | `{ openUrl: content }` | 走 Surge 分支的 action/url/text/media 字段 |
| Loon | `$notification.post` | `{ openUrl: content }` | `openUrl`、`mediaUrl`（仅 http/https） |
| Quantumult X | `$notify` | `{ "open-url": content }` | `open-url`、`media-url`（仅 http/https）、`update-pasteboard` |
| Worker | 不发送通知（非 iOS App 环境） | 无 | 无 |
| Node.js | 不发送通知（非 iOS App 环境） | 无 | 无 |

不可用/差异点：
- `copy/update-pasteboard` 在 Loon 分支不会生效。
- Loon / Quantumult X 对 `media` 仅接受网络 URL；Base64 媒体不会自动映射。
- Worker 不是 iOS App 脚本环境，不支持 iOS 通知行为；当前分支仅日志输出。
- Node.js 不是 iOS App 脚本环境，不支持 iOS 通知行为；当前分支仅日志输出。

### `lib/time.mjs`

#### `time(format, ts)`
- 签名：`time(format: string, ts?: number): string`
- `ts`：可选时间戳（传给 `new Date(ts)`）。
- 支持占位符：`YY`、`yyyy`、`MM`、`dd`、`HH`、`mm`、`ss`、`sss`、`S`（季度）。

```js
time("yyyy-MM-dd HH:mm:ss.sss");
time("yyyyMMddHHmmss", Date.now());
```

注意：当前实现对每个 token 只替换一次（`String.replace` 非全局）。

### `lib/wait.mjs`

#### `wait(delay = 1000)`
- 签名：`wait(delay?: number): Promise<void>`
- 用法：

```js
await wait(500);
```

### `lib/runScript.mjs`（未主入口导出）

#### `runScript(script, runOpts)`
- 签名：`runScript(script: string, runOpts?: { timeout?: number }): Promise<void>`
- 作用：通过 BoxJS `httpapi` 调用本地脚本执行接口：`/v1/scripting/evaluate`。
- 读取存储键：
  - `@chavy_boxjs_userCfgs.httpapi`
  - `@chavy_boxjs_userCfgs.httpapi_timeout`
- 请求体：
  - `script_text`
  - `mock_type: "cron"`
  - `timeout`

示例：
```js
import { runScript } from "./lib/runScript.mjs";
await runScript("$done({})", { timeout: 20 });
```

注意：
- 依赖你本地已正确配置 `httpapi`（`password@host:port`）。
- 函数不返回接口响应，仅在失败时 `Console.error`。

### `getStorage.mjs`

⚠️ 注意：该模块主要为薯条项目的存储结构设计，不作为通用默认 API。  
仅当你的持久化结构与薯条项目一致时才建议使用。

#### `getStorage(key, names, database)`
- 签名：
  - `key: string`（持久化主键）
  - `names: string | string[]`（平台名/配置组名，可嵌套数组）
  - `database: object`（默认数据库）
- 返回：`{ Settings, Configs, Caches }`

合并顺序由 `$argument.Storage` 控制（持久化读取统一使用 `PersistentStore = Storage.getItem(key, {})`；支持别名）：
- 可用值（大小写敏感）：`undefined` | `Argument` | `$argument` | `PersistentStore` | `BoxJs` | `boxjs` | `$persistentStore` | `database`
1. `undefined`：`database[name]` -> `$argument` -> `PersistentStore[name]`
2. `Argument` / `$argument`：`database[name]` -> `PersistentStore[name]` -> `$argument`
3. `PersistentStore` / `BoxJs` / `$persistentStore`（默认）：`database[name]` -> `PersistentStore[name]`
4. `database`：仅 `database[name]`

注意：`Configs` 与 `Caches` 始终按每个 `name` 合并（与 `$argument.Storage` 无关）。

自动类型转换（`Root.Settings`）：
- 字符串 `"true"/"false"` -> `boolean`
- 纯数字字符串 -> `number`
- 含逗号字符串 -> `array`，并尝试逐项转数字

示例：
```js
import getStorage from "@nsnanocat/util/getStorage.mjs";

const store = getStorage("@my_box", ["YouTube", "Global"], database);
```

#### 命名导出（辅助函数）

`getStorage.mjs` 同时导出以下辅助函数：
- `traverseObject(o, c)`：深度遍历对象并替换叶子值
- `string2number(string)`：将纯数字字符串转换为数字
- `value2array(value)`：字符串按逗号拆分；数字/布尔值会被包装为单元素数组

示例：
```js
import getStorage, {
  traverseObject,
  string2number,
  value2array,
} from "@nsnanocat/util/getStorage.mjs";

const store = getStorage("@my_box", ["YouTube", "Global"], database);
```

### `polyfill/fetch.mjs`

`fetch` 现已拆分为 ESM / CJS 两条运行路径：
- `polyfill/fetch.mjs`：仅用于 iOS 脚本平台（Quantumult X / Loon / Surge / Stash / Egern / Shadowrocket）
- `polyfill/fetch.cjs`：用于 Worker / Node.js

`polyfill/fetch.mjs` 仍仿照 Web API `Window.fetch` 设计：
- 参考文档：https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
- 中文文档：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/fetch
- 目标：尽量保持 Web `fetch` 调用习惯，同时补齐各平台扩展参数映射

#### `fetch(resource, options = {})`
- 签名：`fetch(resource: object | string, options?: object): Promise<object>`
- 参数合并：
  - `resource` 为对象：`{ ...options, ...resource }`
  - `resource` 为字符串：`{ ...options, url: resource }`
- 默认方法：无 `method` 时，若有 `body/bodyBytes` -> `POST`，否则 `GET`
- 会删除 headers：`Host`、`:authority`、`Content-Length/content-length`
- `timeout` 规则：
  - 缺省 -> `5`（秒）
  - `> 500` 视为毫秒并转为秒

通用请求字段：
- `url`
- `method`
- `headers`
- `body`
- `bodyBytes`
- `timeout`
- `policy`
- `redirection` / `auto-redirect`
- `auto-cookie`（仅 CJS 的 Worker / Node.js 分支识别；默认启用，传入 `false` / `0` / `-1` 可关闭）

说明：下表是各 App 原生 HTTP 接口的差异补充，以及本库 `fetch` 的内部映射方式。调用方使用统一入参即可。

平台行为差异：

| 平台 | 请求发送接口 | `timeout` 单位 | `policy` 映射 | 重定向字段 | 二进制处理 |
| --- | --- | --- | --- | --- | --- |
| Surge | `$httpClient[method]` | 秒 | 无专门映射 | `auto-redirect` | `Accept` 命中二进制类型时设置 `binary-mode` |
| Loon | `$httpClient[method]` | 毫秒（内部乘 1000） | `node = policy` | `auto-redirect` | 同上 |
| Stash | `$httpClient[method]` | 秒 | `headers.X-Stash-Selected-Proxy` | `auto-redirect` | 同上 |
| Egern | `$httpClient[method]` | 秒 | 无专门映射 | `auto-redirect` | 同上 |
| Shadowrocket | `$httpClient[method]` | 秒 | `headers.X-Surge-Proxy` | `auto-redirect` | 同上 |
| Quantumult X | `$task.fetch` | 毫秒（内部乘 1000） | `opts.policy` | `opts.redirection` | `body(ArrayBuffer/TypedArray)` 转 `bodyBytes`；响应按 `Content-Type` 恢复到 `body` |

返回对象（统一后）常见字段：
- `ok`
- `status`
- `statusCode`
- `statusText`
- `headers`
- `body`
- `bodyBytes`

不可用/差异点：
- `policy` 在 Surge / Egern 分支没有额外适配逻辑。
- `redirection` 在部分平台会映射为 `auto-redirect` 或 `opts.redirection`。
- 传入 `timeout` 时，`5` 和 `5000` 都会被接受；库会先将用户输入归一化，再按平台要求转换为秒或毫秒。
- 返回结构是统一兼容结构，不等同于浏览器 `Response` 对象。

Worker / Node.js 使用说明：
- 请通过 CJS 入口调用：`require("@nsnanocat/util").fetch` 或 `require("@nsnanocat/util/polyfill/fetch").fetch`
- CJS 分支会处理 `auto-cookie`，并将响应归一化为 `ok/status/statusText/body/bodyBytes`

### `polyfill/Storage.mjs`

`Storage` 已拆分为 ESM / CJS 两条运行路径：
- `polyfill/Storage.mjs`：用于 iOS 脚本平台 + Worker
- `polyfill/Storage.cjs`：用于 Worker / Node.js（含 `box.dat` 文件读写）

`polyfill/Storage.mjs` 仍仿照 Web Storage 接口（`Storage`）设计：
- 参考文档：https://developer.mozilla.org/en-US/docs/Web/API/Storage
- 中文文档：https://developer.mozilla.org/zh-CN/docs/Web/API/Storage
- 目标：统一 VPN App 脚本环境中的持久化读写接口，并尽量贴近 Web Storage 行为

#### `Storage.getItem(keyName, defaultValue = null)`
- 支持普通 key：按平台读持久化。
- 支持路径 key：`@root.path.to.key`。

#### `Storage.setItem(keyName, keyValue)`
- 普通 key：按平台写持久化。
- 路径 key：`@root.path` 写入嵌套对象。
- `keyValue` 为对象时自动 `JSON.stringify`。

#### `Storage.removeItem(keyName)`
- Quantumult X：可用（`$prefs.removeValueForKey`）。
- Surge：通过 `$persistentStore.write(null, keyName)` 删除。
- Worker：可用（仅删除内存缓存中的对应 key，不持久化）。
- Node.js：ESM 路径不支持，会提示改用 CJS 入口。
- Loon / Stash / Egern / Shadowrocket：返回 `false`。

#### `Storage.clear()`
- Quantumult X：可用（`$prefs.removeAllValues`）。
- Worker：可用（仅清空内存缓存，不持久化）。
- Node.js：ESM 路径不支持，会提示改用 CJS 入口。
- 其他平台：返回 `false`。

#### Worker 特性（ESM）
- Worker：使用进程内内存缓存，不写文件。

#### Node.js 特性（CJS）
- 数据文件默认：`box.dat`。
- 读取路径优先级：当前目录 -> `process.cwd()`。

Node.js 使用说明：
- 请通过 CJS 入口调用：`require("@nsnanocat/util").Storage` 或 `require("@nsnanocat/util/polyfill/Storage").Storage`
- CJS 的 `Storage` 分支支持 `box.dat` 读写与落盘

与 Web Storage 的行为差异：
- 支持 `@key.path` 深路径读写（Web Storage 原生不支持）。
- `removeItem/clear` 仅部分平台可用：
  - ESM 路径：Quantumult X、Worker，以及 Surge 的 `removeItem`
  - CJS 路径：Worker、Node.js
- `getItem` 会尝试 `JSON.parse`，`setItem` 写入对象会 `JSON.stringify`。

平台后端映射：

| 平台 | 读写接口 |
| --- | --- |
| Surge / Loon / Stash / Egern / Shadowrocket | `$persistentStore.read/write` |
| Quantumult X | `$prefs.valueForKey/setValueForKey` |
| Worker（ESM/CJS） | 进程内内存缓存 |
| Node.js（仅 CJS） | 本地 `box.dat` |

### `polyfill/Console.mjs`

`Console` 是统一日志工具（静态类）。

#### 日志级别
- `Console.logLevel` 可读写。
- 支持：`OFF(0)` / `ERROR(1)` / `WARN(2)` / `INFO(3)` / `DEBUG(4)` / `ALL(5)`。

`logLevel` 用法示例：

```js
import { Console } from "@nsnanocat/util";

Console.logLevel = "debug"; // 或 4
Console.debug("debug message");

Console.logLevel = 2; // WARN
Console.info("won't print at WARN level");
Console.warn("will print");

console.log(Console.logLevel); // "WARN"
```

#### 方法
- `clear()`
- `count(label = "default")`
- `countReset(label = "default")`
- `debug(...msg)`
- `error(...msg)`
- `exception(...msg)`
- `group(label)`
- `groupEnd()`
- `info(...msg)`
- `log(...msg)`
- `time(label = "default")`
- `timeLog(label = "default")`
- `timeEnd(label = "default")`
- `warn(...msg)`

参数与返回值：

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `clear()` | 无 | `void` | 当前实现为空函数 |
| `count(label)` | `label?: string` | `void` | 计数并输出 |
| `countReset(label)` | `label?: string` | `void` | 重置计数器 |
| `debug(...msg)` | `...msg: any[]` | `void` | 仅 `DEBUG/ALL` 级别输出 |
| `error(...msg)` | `...msg: any[]` | `void` | Worker / Node.js 优先输出 `stack` |
| `exception(...msg)` | `...msg: any[]` | `void` | `error` 别名 |
| `group(label)` | `label: string` | `void` | 压栈分组 |
| `groupEnd()` | 无 | `void` | 出栈分组 |
| `info(...msg)` | `...msg: any[]` | `void` | `INFO` 及以上 |
| `log(...msg)` | `...msg: any[]` | `void` | 通用日志 |
| `time(label)` | `label?: string` | `void` | 记录起始时间 |
| `timeLog(label)` | `label?: string` | `void` | 输出耗时 |
| `timeEnd(label)` | `label?: string` | `void` | 清除计时器 |
| `warn(...msg)` | `...msg: any[]` | `void` | `WARN` 及以上 |

平台差异：
- Worker / Node.js 下 `error` 会优先打印 `Error.stack`。
- 其他平台统一加前缀符号输出（`❌/⚠️/ℹ️/🅱️`）。

### `polyfill/Lodash.mjs`

`Lodash` 为“部分方法的简化实现”，不是完整 Lodash。各方法语义可参考：
- https://www.lodashjs.com
- https://lodash.com

导入约定（建议）：
- 这是 lodash 官方示例中常见的惯例写法：使用 `_` 作为工具对象别名。

```js
import { Lodash as _ } from "@nsnanocat/util";

const data = {};
_.set(data, "a.b", 1);
console.log(data); // { a: { b: 1 } }

const value = _.get(data, "a.b", 0);
console.log(value); // 1
```

示例对应的 lodash 官方文档页面：
- `set(object, path, value)`
  - 官方文档：https://lodash.com/docs/#set
  - 中文文档：https://www.lodashjs.com/docs/lodash.set
- `get(object, path, defaultValue)`
  - 官方文档：https://lodash.com/docs/#get
  - 中文文档：https://www.lodashjs.com/docs/lodash.get

当前实现包含：
- `escape(string)`
- `unescape(string)`
- `toPath(value)`
- `get(object, path, defaultValue)`
- `set(object, path, value)`
- `unset(object, path)`
- `pick(object, paths)`
- `omit(object, paths)`
- `merge(object, ...sources)`

对应 lodash 官方文档页面：
- `escape(string)`
  - 官方文档：https://lodash.com/docs/#escape
  - 中文文档：https://www.lodashjs.com/docs/lodash.escape
- `unescape(string)`
  - 官方文档：https://lodash.com/docs/#unescape
  - 中文文档：https://www.lodashjs.com/docs/lodash.unescape
- `toPath(value)`
  - 官方文档：https://lodash.com/docs/#toPath
  - 中文文档：https://www.lodashjs.com/docs/lodash.toPath
- `get(object, path, defaultValue)`
  - 官方文档：https://lodash.com/docs/#get
  - 中文文档：https://www.lodashjs.com/docs/lodash.get
- `set(object, path, value)`
  - 官方文档：https://lodash.com/docs/#set
  - 中文文档：https://www.lodashjs.com/docs/lodash.set
- `unset(object, path)`
  - 官方文档：https://lodash.com/docs/#unset
  - 中文文档：https://www.lodashjs.com/docs/lodash.unset
- `pick(object, paths)`
  - 官方文档：https://lodash.com/docs/#pick
  - 中文文档：https://www.lodashjs.com/docs/lodash.pick
- `omit(object, paths)`
  - 官方文档：https://lodash.com/docs/#omit
  - 中文文档：https://www.lodashjs.com/docs/lodash.omit
- `merge(object, ...sources)`
  - 官方文档：https://lodash.com/docs/#merge
  - 中文文档：https://www.lodashjs.com/docs/lodash.merge

参数与返回值：

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `escape` | `string: string` | `string` | HTML 转义 |
| `unescape` | `string: string` | `string` | HTML 反转义 |
| `toPath` | `value: string` | `string[]` | `a[0].b` -> `['a','0','b']` |
| `get` | `object?: object, path?: string\\|string[], defaultValue?: any` | `any` | 路径读取 |
| `set` | `object: object, path: string\\|string[], value: any` | `object` | 路径写入（会创建中间层） |
| `unset` | `object?: object, path?: string\\|string[]` | `boolean` | 删除路径并返回结果 |
| `pick` | `object?: object, paths?: string\\|string[]` | `object` | 挑选 key（仅第一层） |
| `omit` | `object?: object, paths?: string\\|string[]` | `object` | 删除 key（会修改原对象） |
| `merge` | `object: object, ...sources: object[]` | `object` | 深合并（非完整 lodash 行为） |

`merge` 行为（与 lodash 官方有差异）：
- 深度合并 Plain Object。
- Array 直接覆盖；空数组不覆盖已存在值。
- Map/Set 支持同类型合并；空 Map/Set 不覆盖已存在值。
- `undefined` 不覆盖，`null` 会覆盖。
- 直接修改目标对象（mutates target）。

### `polyfill/qs.mjs`

当前实现为项目内使用的轻量子集，不追求与官方 `qs` 完全一致。

#### `qs.parse(query)`
- 签名：`qs.parse(query?: string | object | null): object`
- 作用：将查询字符串或对象输入归一化为支持深路径的对象。
- 依赖：内部使用 `Lodash.set` 展开路径。

当前行为：
- 当 `query` 为 `string` 时：
  - 支持前导 `?`（会先去掉）。
  - 按 `&` / `=` 切分。
  - key 与 value 都会先执行 URL 解码（`decodeURIComponent`，并将 `+` 视为空格）。
  - 去掉值中的双引号。
  - 支持点路径、数组下标路径，以及方括号 key（如 `a[b]`）展开对象。
- 当 `query` 为 `object` 时：
  - 将 key 当路径写入新对象（`{"a.b":"1"}` -> `{ a: { b: "1" } }`）。
- 当 `query` 为 `null` 或 `undefined` 时：
  - 返回 `{}`。

```js
import { qs } from "@nsnanocat/util";

console.log(qs.parse("mode=on&a.b=1"));
// { mode: "on", a: { b: "1" } }

console.log(qs.parse("a%5Bb%5D=c%20d"));
// { a: { b: "c d" } }

console.log(qs.parse({ "list[0]": "x", "list[1]": "y" }));
// { list: ["x", "y"] }
```

#### `qs.stringify(object)`
- 签名：`qs.stringify(object?: object): string`
- 作用：将对象按深路径展开为查询字符串。
- 依赖：内部使用 `Lodash.get` 与 `Lodash.toPath` 读取并格式化路径。

当前行为：
- 普通对象输出为点路径（`a.b=1`）。
- 数组输出为索引路径（`list[0]=x`）。
- 值始终执行 `encodeURIComponent` 编码。
- `null` 会序列化为空值（`key=`），`undefined` 会跳过。

```js
import { qs } from "@nsnanocat/util";

console.log(qs.stringify({ a: { b: "1" }, list: ["x", "y"] }));
// a.b=1&list%5B0%5D=x&list%5B1%5D=y
```

### `polyfill/StatusTexts.mjs`

#### `StatusTexts`
- 类型：`Record<number, string>`
- 内容：HTTP 状态码到状态文本映射（100~511 的常见码）。
- 主要用途：给 Quantumult X 的 `$done` 状态行补全文本（如 `HTTP/1.1 200 OK`）。
- 参考示例：https://github.com/crossutility/Quantumult-X/raw/refs/heads/master/sample-rewrite-response-header.js

## 平台差异总览

说明：本节展示的是各平台原生脚本接口差异。实际在本库中，这些差异已由 `done`、`fetch`、`notification`、`Storage` 等模块做了统一适配。

| 能力 | Quantumult X | Loon | Surge | Stash | Egern | Shadowrocket | Worker | Node.js |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HTTP 请求 | `$task.fetch` | `$httpClient` | `$httpClient` | `$httpClient` | `$httpClient` | `$httpClient` | `fetch` | `fetch` |
| 通知 | `$notify` | `$notification.post` | `$notification.post` | `$notification.post` | `$notification.post` | `$notification.post` | 无 | 无 |
| 持久化 | `$prefs` | `$persistentStore` | `$persistentStore` | `$persistentStore` | `$persistentStore` | `$persistentStore` | 内存缓存 | `box.dat` |
| 结束脚本 | `$done` | `$done` | `$done` | `$done` | `$done` | `$done` | 仅日志 | `process.exit(1)` |
| `removeItem/clear` | 可用 | 不可用 | `removeItem` 可用 / `clear` 不可用 | 不可用 | 不可用 | 不可用 | 可用 | 可用 |
| `policy` 注入（`fetch/done`） | `opts.policy` | `node` | `X-Surge-Policy`(done) | `X-Stash-Selected-Proxy` | 无专门映射 | `X-Surge-Proxy`(fetch) | 无 | 无 |

## 已知限制与注意事项

- `lib/argument.mjs` 为 `$argument` 标准化模块，`import` 时会按规则重写全局 `$argument`。
- `lib/done.mjs` 在 Worker 仅记录结束日志。
- `lib/done.mjs` 在 Node.js 固定 `process.exit(1)`。
- `Storage.removeItem("@a.b")` 分支存在未声明变量写入风险；如要大量使用路径删除，建议先本地验证。
- `lib/runScript.mjs` 未从包主入口导出，需要按文件路径直接导入。

## 参考资料

以下资料用于对齐不同平台 `$` API 语义；README 的“平台差异”优先以本仓库实现为准。

### Surge
- [Surge Manual - Scripting API](https://manual.nssurge.com/scripting/common.html)
- [Surge Manual - HTTP Client API](https://manual.nssurge.com/scripting/http-client.html)

### Stash
- [Stash Docs - Scripting Overview](https://stash.wiki/scripting/overview/)
- [Stash Docs - API](https://stash.wiki/scripting/apis/)
- [Stash Docs - Rewrite Script](https://stash.wiki/scripting/rewrite-script/)

### Loon
- [Loon Script](https://nsloon.app/Loon-Script)
- [Loon API](https://nsloon.app/Loon-API)

### Quantumult X
- [crossutility/Quantumult-X - sample-task.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample-task.js)
- [crossutility/Quantumult-X - sample-rewrite-with-script.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample-rewrite-with-script.js)
- [crossutility/Quantumult-X - sample-fetch-opts-policy.js](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample-fetch-opts-policy.js)
- [crossutility/Quantumult-X - sample-rewrite-response-header.js](https://github.com/crossutility/Quantumult-X/raw/refs/heads/master/sample-rewrite-response-header.js)

### Worker
- 以 `Cloudflare` 全局标记识别 Worker 运行时。

### Node.js
- [Node.js Globals - fetch](https://nodejs.org/api/globals.html#fetch)

### Web API / Lodash
- [MDN - Window.fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
- [MDN（中文）- Window.fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/fetch)
- [MDN - Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
- [MDN（中文）- Storage](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage)
- [Lodash Docs](https://www.lodashjs.com)
- [lodash.com](https://lodash.com)

### Egern / Shadowrocket
- [Egern Docs - Scriptings 配置](https://egernapp.com/docs/configuration/scriptings)
- [Shadowrocket 官方站点](https://www.shadowlaunch.com/)

> 说明：Egern 与 Shadowrocket 暂未检索到等价于 Surge/Loon/Stash 的完整公开脚本 API 页面；相关差异说明以本库实际代码分支行为为准。
