## Working agreements

### 公共规范
- 任何新增的（不含参考实现已有的）非必要的辅助属性和函数或中间件都需要说明必要性，并得到我的批准。
- 禁止新增仅有一处调用的辅助函数，除非该函数逻辑足够复杂且抽离能显著提升可读性与可维护性。
- 必须使用标准文档注释签名，且必须包含 JSDoc 与参数、返回值签名。
- 所有注释必须使用中英双语：内容介绍使用双行，先写一行中文，再写一行英文；参数与返回值使用单行，中文/英文。
- 有疑问、歧义或存在多种可行实施方案时，必须先停下来向用户确认，不得想当然地自行决定并直接修改。

#### 提交规范
- 未经用户明确要求，不主动创建 commit。
- 进行 git 提交前，必须确认本次提交只包含目标变更，不混入无关修改。
- 进行 git 提交时，提交信息必须遵守 Conventional Commits 规范。
- 提交文本需要用中文书写，对于专有名词，可以在括号中注明英文。

### iOS/macOS 项目规范

#### 技术栈与框架
- 本项目使用 Swift 6.2 开发，代码应始终采用当前推荐的最新写法。
- 本项目使用 SwiftData，禁止使用 Core Data 语法。
- 本项目使用 SwiftUI，未经明确要求不得引入 UIKit 或 AppKit 组件。

#### MVVM 架构约束
- 项目遵循 MVVM 架构，并使用 `@Observable` 宏进行数据绑定；禁止使用 `@Published` 与 `@StateObject`。
- `Model` 可根据场景选择 `class` 或 `struct`。
- `View` 必须使用 `struct`，禁止使用 `class`。
- `ViewModel` 必须使用 `@Observable class`，禁止使用 `struct`。
- `@Observable` 仅可用于 `class`，不可用于 `struct`。
- `@Environment` 仅可用于 `struct`，不可用于 `class`。
- `@Model`中不可以使用 `didSet`。

#### SwiftData 模型约束
- 模型必须使用 `@Model` 宏标记，并且必须是 `class`，禁止使用 `struct`。
- 不准将 `@Model` 对象直接传递到其他线程或标记为 `@Sendable`，只允许传递 `PersistentIdentifier`。
  - 如需跨线程读写，需要创建对应的 `@ModelActor public actor DataHandler` 或 `extension DataHandler` 将 `@Model` 对象的操作封装在 actor 内部。
  - 通过 `DataHandler` 提供的接口传递 `PersistentIdentifier` 来访问同一个 `@Model` 对象。
  - 在 `DataHandler` 中优先使用 `modelContext.transaction` 来执行对 `@Model` 对象的读写操作，确保数据一致性和线程安全。
  - `modelContext.transaction` 在 `extension DataHandler` 中正常可用，无需额外传递 `modelContext`，Xcode 会自动识别。
  - `Cannot find 'modelContext' in scope` 错误是误判，实际无此问题，忽略即可。
- SwiftData 模型字段改名或别名映射必须使用 `@Attribute(originalName: "旧字段名")` 绑定历史存储列名；禁止用计算属性充当可查询别名。
- 计算属性不能作为谓词条件（Predicate）使用；谓词只使用持久化存储字段。

#### 文件组织规范
- 代码文件需按类型放入以下目录之一：`Views`、`ViewModels`、`Models`、`Extensions`、`Builders`、`Components`、`Examples`、`Protocols`。
- `extension` 必须单独成文件，并放在项目的 `Extensions` 文件夹；命名规则：`原对象名称+扩展功能名称`。
- `enum` 必须单独成文件，并放在项目的 `Model` 文件夹；`enum` 类型名需以 `Type` 结尾，文件名同样以 `Type` 结尾。

### JavaScript/TypeScript 项目规范

#### 技术栈与模块
- 当前 js/ts 项目使用 Node.js ES Modules，需遵循 `package.json` 中的 `type: "module"`，不得无故回退到 CommonJS 写法。
- 对外公开接口以 `package.json` 的 `exports` 与 `README.md` 中已记录的导入方式为准，未经明确要求不得随意扩大、重命名或破坏公开导出面。
- 变更已公开模块时，必须同步维护 `.mjs`、`.mts`、`.d.ts` 之间的运行时实现、类型定义与导出结构一致性。

#### 代码风格与组织
- js/ts 代码需遵循当前仓库的 Biome 配置与既有代码风格，包括统一 2 空格缩进、双引号、LF 行尾与现有 import 组织方式。
- js/ts 对外接口与非直观实现必须提供完整 JSDoc 与签名信息，确保参数、返回值和行为语义可读。
- 优先沿用当前仓库的平铺模块组织方式；未经明确要求，不新增与现有导出结构不匹配的目录层级、封装层或中间适配层。
- 对现有公共 API 的行为调整应优先修复根因，避免只在 README 或类型声明层做表面补丁。

#### 测试与文档
- 测试优先沿用 `node --test` 与 `test/*.js` 的现有模式；新增或变更公开行为时，应同步补充或更新对应测试。
- 对外 API、导入方式、导出结构或行为语义发生变化时，应同步更新 `README.md` 中的示例与说明，确保文档与实现一致。
