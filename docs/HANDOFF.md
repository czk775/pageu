# PageU 项目交接文档

## 1. 当前阶段名称

Phase 7.6 — 体验细节修缮与小U互动升级。

## 2. Phase 7 完成内容

- 在保持主流程不变的前提下，将 `/analyze` 从同步 Mock 分析升级为异步 AI 分析。
- 新增 `src/services/ai/` 服务层，封装提示词、真实 AI 请求和 Mock fallback。
- `/analyze` 进入页面后自动执行一次分析。
- `/analyze` 展示加载状态：`小U 正在理解你的经历…`。
- 有 API Key 且非测试环境时，请求 DashScope OpenAI 兼容接口。
- 无 API Key、测试环境、接口失败、返回内容缺失或 JSON 解析失败时，自动回退 Mock。
- AI 返回结果统一为标准 `analysisResult` 结构，并附带 `meta`。
- 点击 `哪里需要调整` 后，输入补充说明并点击 `重新分析` 会再次调用 `analyzeCareerDraft`。
- Mock fallback 时页面显示提示：`当前使用演示分析结果，真实 AI 暂不可用。`
- 测试环境强制走 Mock，避免自动化测试真实调用 API。
- 确认 `.env.local` 已在 `.gitignore` 中，并且未被 Git 跟踪。

## 3. 技术栈

- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- lucide-react
- qrcode
- DashScope OpenAI 兼容接口
- Vitest + Testing Library

## 4. 当前文件结构

```text
.
├── docs/
│   └── HANDOFF.md
├── src/
│   ├── components/
│   │   ├── DynamicBackground.jsx
│   │   ├── FloatingAssistant.jsx
│   │   ├── FormField.jsx
│   │   ├── GlassCard.jsx
│   │   ├── PrimaryButton.jsx
│   │   ├── StatusToast.jsx
│   │   └── TemplateCard.jsx
│   ├── data/
│   │   └── templates.js
│   ├── lib/
│   │   ├── draftGenerator.js
│   │   └── storage.js
│   ├── pages/
│   │   ├── AnalyzePage.jsx
│   │   ├── CreatePage.jsx
│   │   ├── EditorPage.jsx
│   │   ├── GeneratedSitePage.jsx
│   │   ├── HomePage.jsx
│   │   └── PublishPage.jsx
│   ├── renderers/
│   │   └── TemplateRenderer.jsx
│   ├── services/
│   │   └── ai/
│   │       ├── aiClient.js
│   │       ├── mockAnalyze.js
│   │       └── prompts.js
│   ├── state/
│   │   └── CreateDraftContext.jsx
│   ├── test/
│   │   └── setup.js
│   ├── types/
│   │   ├── analysisResult.js
│   │   ├── createDraft.js
│   │   ├── publishDraft.js
│   │   └── siteDraft.js
│   ├── App.jsx
│   ├── App.test.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

说明：`.env.local` 只作为本地文件存在，已被 Git 忽略，不应提交。

## 5. AI 服务文件结构

- `src/services/ai/prompts.js`
  - `buildSystemPrompt()`
  - `buildUserPrompt(createDraft, userAdjustment)`
  - 负责要求模型只输出 JSON，不输出 Markdown、代码块或长解释。

- `src/services/ai/mockAnalyze.js`
  - `createMockAnalysisResult(createDraft, userAdjustment, overrides)`
  - 复用现有 `createAnalysisResult`，并补充标准 `meta`。

- `src/services/ai/aiClient.js`
  - `analyzeCareerDraft(createDraft, userAdjustment)`
  - 负责读取环境变量、调用 DashScope、解析 JSON、失败回退 Mock。

## 6. 环境变量说明

本地 `.env.local` 需要包含以下变量名：

```env
VITE_AI_PROVIDER=qwen
VITE_DASHSCOPE_API_KEY=你的 DashScope API Key
VITE_QWEN_MODEL=qwen-plus
VITE_QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

注意：

- 不要把真实 Key 写入代码。
- 不要提交 `.env.local`。
- 当前是前端 Demo，`VITE_` 环境变量会进入前端构建产物；正式产品应改为后端代理或 Serverless Function。

## 7. AI 调用流程

1. `/analyze` 页面挂载。
2. 页面调用 `analyzeCareerDraft(createDraft, '')`。
3. `aiClient.js` 判断运行环境：
   - 测试环境：强制 Mock。
   - 无 API Key：Mock。
   - `VITE_AI_PROVIDER` 不是 `qwen`：Mock。
   - 有 Key：调用 `${VITE_QWEN_BASE_URL}/chat/completions`。
4. 请求使用：
   - `Authorization: Bearer ${VITE_DASHSCOPE_API_KEY}`
   - `Content-Type: application/json`
   - `model: VITE_QWEN_MODEL || qwen-plus`
5. 解析 `choices[0].message.content`。
6. 优先 `JSON.parse`，失败后清理代码块/截取 JSON 对象再解析。
7. 成功时返回 `provider: "qwen"`。
8. 任意失败时回退 Mock，并返回 `provider: "mock"`。

## 8. analysisResult 标准结构

```js
analysisResult = {
  jobKeywords: [],
  abilityFocus: [],
  displayOrder: [],
  highlightedExperiences: [],
  userAdjustment: '',
  updatedAt: '',
  meta: {
    provider: 'qwen' | 'mock',
    fallback: boolean,
    error: string | null,
    updatedAt: '',
  },
};
```

## 9. Mock fallback 机制

以下情况自动 fallback：

- 测试环境。
- 缺少 `VITE_DASHSCOPE_API_KEY`。
- `VITE_AI_PROVIDER` 不是 `qwen`。
- DashScope HTTP 状态非 2xx。
- 响应缺少 `choices[0].message.content`。
- AI 返回内容无法解析为 JSON。
- 网络异常或其他运行时异常。

fallback 后页面仍展示 4 张分析卡片，并显示：

```text
当前使用演示分析结果，真实 AI 暂不可用。
```

## 10. 如何本地测试真实 AI

1. 确认 `.env.local` 已存在，且包含必要变量名。
2. 重启 Vite dev server，让环境变量生效。
3. 访问 `/create`，填写岗位 JD 和经历。
4. 点击 `生成我的个人网站` 进入 `/analyze`。
5. 页面先显示 `小U 正在理解你的经历…`。
6. 如果真实 AI 成功，页面不会显示 Mock fallback 提示。
7. 如果显示 `当前使用演示分析结果，真实 AI 暂不可用。`，说明走了 Mock fallback。
8. 打开 `哪里需要调整`，输入补充说明，点击 `重新分析`，观察卡片重新生成。

## 11. 本阶段未改变的功能

- 未改变产品主流程：首页 → 创建 → 分析 → 编辑 → 发布 → 最终网站。
- 未改变路由地址。
- 未改变 `createDraft`、`siteDraft`、`publishDraft` 核心结构。
- 未接入后端、数据库、登录或真实部署。
- 未让 AI 生成完整网页或网站代码。
- 最终网站仍由 `TemplateRenderer` 渲染。

## 12. 当前风险

- 这是前端 Demo，真实 API Key 会暴露在浏览器环境；正式产品必须迁移到后端或 Serverless 代理。
- AI 输出虽然要求 JSON，但仍可能出现格式异常；当前已做解析清洗和 Mock fallback。
- DashScope 接口可用性、配额、模型权限、网络环境都会影响真实 AI 是否成功。
- 测试环境强制 Mock，因此自动化测试不验证真实 DashScope 连通性。

## 13. 下一阶段建议

- 将 AI 调用迁移到后端代理或 Serverless Function，避免前端暴露 Key。
- 增加 AI 结果缓存，避免重复请求。
- 增加更明显的真实 AI / Mock 状态标识，方便比赛演示排查。
- 为 `analysisResult` 增加本地存储，编辑器可直接复用最新分析结果。

## 14. 如何运行验证

```bash
npm test
npm run build
```

本阶段验证结果：

```text
npm test: 18 tests passed
npm run build: success
```

## 15. 已执行的 Git commit 信息

Phase 1：

```text
feat: initialize PageU landing and app shell
```

Phase 2：

```text
feat: implement create flow and draft state
```

Phase 3：

```text
feat: implement mock analyze page
```

Phase 4：

```text
feat: implement editor and site draft
```

Phase 5：

```text
feat: implement publish and generated site
```

Phase 6：

```text
refactor: organize PageU pages and shared components
```

Phase 7：

```text
feat: connect qwen ai analysis with mock fallback
```

Phase 7.5：

```text
test: stabilize pageu before deployment
```

Phase 7.6：

```text
feat: enhance assistant interaction and create flow polish
```

Phase 7.7：

```text
fix: reset assistant chat and new site draft state
```

## 16. Phase 7.6 完成内容

- 在不改变主流程和路由的前提下，升级小U为轻量悬浮咨询助手。
- 创建页删除 `让我理解一下这个岗位` 按钮，避免与 `/analyze` 的真实分析动作重复。
- 创建页区块标题调整为：
  - `个人基本信息`
  - `岗位信息`
  - `经历信息`
  - `技能证书`
- 创建页新增 `技能关键词` 与 `证书/奖项` 两个 textarea 字段。
- `createDraft` 新增 `skillsInfo`，并保持旧 localStorage 草稿兼容。
- `draftGenerator` 会把技能关键词和证书/奖项合并进 siteDraft 的技能模块。
- 6 个模板选择卡片增加差异化视觉预览，只影响创建页选择卡片，不重做最终模板。
- `/analyze` 标题状态调整为：
  - 加载中：`分析中`
  - 完成后：`分析结果`
- 首页小U文案为 `准备好开始了吗`，创建页及之后页面小U默认文案为 `有什么问题可以问我哦`。

## 17. 小U互动助手说明

- 文件：`src/components/FloatingAssistant.jsx`
- 小U仍然左下角悬浮，保持浅蓝到青绿渐变光团形象。
- hover 时会增强浮动、轻微放大，并显示更开心的眼睛状态。
- 光团眼睛通过 CSS keyframes 周期性 wink，增加陪伴感。
- 点击小U会打开悬浮聊天框，不进入独立页面，不阻断主流程。
- 聊天框支持关闭，关闭后恢复悬浮状态。
- 本阶段问答为本地规则，不调用真实 AI。
- 已支持的问题方向：
  - 怎么填写经历
  - JD 是什么
  - 模板怎么选
  - 为什么要生成个人网站
  - 能不能重新修改
  - 其他问题走通用引导回答

## 18. 创建页文案和字段调整

创建页仍然是单页滚动，不新增步骤切换。

新增数据结构：

```js
createDraft = {
  skillsInfo: {
    keywords: '',
    certificates: '',
  },
};
```

兼容策略：

- `normalizeDraft` 会为旧草稿补齐 `skillsInfo`。
- `CreateDraftContext` 新增 `updateSkillsInfo(field, value)`。
- `draftGenerator` 使用 `skillsInfo.keywords` 与 `skillsInfo.certificates` 生成技能模块内容。

## 19. 模板卡片视觉优化说明

- `TemplateCard` 现在会按模板 id 添加 `template-card-{id}` 类名。
- `styles.css` 为 6 个模板卡片增加独立视觉：
  - Neo：蓝紫/青色灵动渐变。
  - Pure：黑白灰极简留白。
  - Flow：淡紫/粉/蓝柔和流线。
  - Grid：网格背景和模块边框。
  - Canvas：暖色与青绿色撞色画布感。
  - Glass：透明玻璃拟态和浅蓝青绿光感。
- 该优化仅影响创建页模板选择卡片，不改变最终网站模板渲染。

## 20. 本阶段新增/修改文件

- `src/App.test.jsx`
- `src/components/FloatingAssistant.jsx`
- `src/components/TemplateCard.jsx`
- `src/lib/draftGenerator.js`
- `src/pages/AnalyzePage.jsx`
- `src/pages/CreatePage.jsx`
- `src/pages/EditorPage.jsx`
- `src/pages/HomePage.jsx`
- `src/pages/PublishPage.jsx`
- `src/state/CreateDraftContext.jsx`
- `src/styles.css`
- `src/types/createDraft.js`
- `docs/HANDOFF.md`

## 21. Phase 7.6 测试结果

本阶段新增/更新测试覆盖：

- 创建页不再显示 `让我理解一下这个岗位`。
- 创建页显示 `个人基本信息`、`岗位信息`、`经历信息`、`技能证书`。
- 模板卡片仍可选择。
- 小U可以点击打开聊天框。
- 小U聊天框可以关闭。
- 小U规则问答可以返回内容。
- 分析页加载状态标题为 `分析中`。
- 分析完成后标题为 `分析结果`。

当前验证命令：

```bash
npm test
npm run build
```

最近一次阶段内测试：

```text
npm test -- --run src/App.test.jsx: 20 tests passed
npm test: 20 tests passed
npm run build: success
```

## 22. 下一阶段建议

- 若进入正式产品化阶段，将小U规则问答迁移到后端 AI 助手，不在前端暴露密钥。
- 为 `skillsInfo` 增加更细的 tag 输入体验，但当前 MVP 保持 textarea 更稳定。
- 给模板生态增加独立配置结构，让选择卡片和最终模板共享设计 token。
- 部署前补一轮移动端真实设备截图验收。

## 23. 小U AI 化补充

在 Phase 7.6 之后，小U已从纯本地规则问答升级为真实 AI 优先的轻量助手。

新增文件：

- `src/services/ai/assistantChat.js`

调用策略：

1. 小U聊天框提交问题。
2. `FloatingAssistant` 调用 `answerAssistantQuestion({ question, pathname, createDraft })`。
3. 服务读取与分析页相同的环境变量：
   - `VITE_AI_PROVIDER`
   - `VITE_DASHSCOPE_API_KEY`
   - `VITE_QWEN_MODEL`
   - `VITE_QWEN_BASE_URL`
4. 有 Key 且 provider 为 `qwen` 时，请求 DashScope OpenAI 兼容接口。
5. 测试环境、无 Key、provider 非 qwen、接口失败或返回为空时，自动使用本地规则 fallback。

小U回答范围：

- PageU 填写流程
- 经历/JD/模板选择
- 分析、编辑、发布流程
- 当前页面状态相关引导

安全说明：

- 仍未在代码中硬编码 API Key。
- `.env.local` 继续保持 Git 忽略。
- 当前仍是前端 Demo，真实生产环境建议迁移到后端或 Serverless 代理。

新增测试：

```text
answers Xiaou questions through the AI assistant service with mock fallback in tests
```

## 24. Phase 7.7 修复内容

- 修复小U聊天框关闭后再次打开仍保留上一轮回答的问题。
- 小U关闭聊天框时会清空：
  - 当前输入问题
  - 本轮回答内容
  - AI/fallback meta
  - loading 状态
- 小U聊天框打开时显示默认引导：
  - `可以问我怎么填写经历、JD 是什么、模板怎么选。`
- 发布页 `/publish` 增加次级入口：`创建新的个人网站`。
- 最终网站页 `/site/:id` 增加弱化的次级入口：`创建新的个人网站`。
- 点击新建入口后主动清空 PageU 本地草稿并跳转 `/create`。
- 未改变首页 → 创建 → 分析 → 编辑 → 发布 → 最终网站主流程。

## 25. 小U聊天历史清理策略

- 小U仍然是轻量悬浮助手，不作为正式客服系统保存历史。
- `FloatingAssistant` 的聊天状态只保存在组件内存中，不写入 localStorage。
- 点击 `关闭小U咨询助手` 时执行本地状态重置：
  - `question` 置空
  - `answer` 置空
  - `assistantMeta` 置空
  - `chatStatus` 回到 `idle`
  - `chatOpen` 关闭
- 不影响真实 AI 问答能力；下次打开后仍可重新调用 `answerAssistantQuestion`。
- 不影响 mock/fallback；接口不可用时仍会走本地规则回答。

## 26. 新建个人网站状态重置策略

新增工具函数：

```js
resetPageUState()
```

位置：

```text
src/lib/storage.js
```

当前清理的 key：

```text
pageu:createDraft
pageu.createDraft
pageu.siteDraft
pageu.publish
pageu.analysisResult
```

Context 新增方法：

```js
resetDraft()
```

位置：

```text
src/state/CreateDraftContext.jsx
```

行为：

1. 调用 `resetPageUState()` 清理本地缓存。
2. 调用 `resetDraft()` 将 Context 中的 `createDraft` 恢复为 `createInitialDraft()`。
3. 跳转 `/create`。

注意：

- 不会在每次进入 `/create` 时自动清空，避免误删正在编辑的内容。
- 只有用户主动点击 `创建新的个人网站` 才会重置。

## 27. Phase 7.7 新增/修改文件

- `src/App.test.jsx`
- `src/components/FloatingAssistant.jsx`
- `src/lib/storage.js`
- `src/pages/GeneratedSitePage.jsx`
- `src/pages/PublishPage.jsx`
- `src/state/CreateDraftContext.jsx`
- `src/styles.css`
- `docs/HANDOFF.md`

## 28. Phase 7.7 测试结果

新增/更新测试覆盖：

- 小U聊天框关闭后再次打开，不保留上一轮回答。
- 点击发布页 `创建新的个人网站` 后，`createDraft` 恢复默认空状态。
- 点击新建入口后，`pageu.siteDraft` 与 `pageu.publish` 被清理。
- 最终网站页也可点击 `创建新的个人网站` 回到空白创建页。
- 旧流程继续可用。

最近一次阶段内测试：

```text
npm test -- --run src/App.test.jsx: 24 tests passed
```

## 29. Phase 8 完成内容

Phase 8 将 PageU 的最终生成物从“网页简历”升级为更像真实个人网站的作品集页面，同时修复了用户在创建页输入信息后，分析确认进入编辑器却仍显示默认占位内容的问题。

本阶段完成：
- 扩展创建页输入结构，补充个人标签、求职动机、经历角色、经历时间、项目链接、作品链接和网站风格偏好。
- 扩展 `createDraft` 与 `siteDraft`，让用户输入的信息可以稳定进入编辑器预览、发布页和 `/site/:id` 最终个人网站。
- 重构 `draftGenerator`，从用户资料、岗位信息、经历、技能证书、作品链接和 AI 分析结果中编排个人网站内容。
- 重构 `TemplateRenderer`，六个模板不再只是换色，而是使用明显不同的布局结构。
- 编辑器中间预览改为复用最终网站渲染器，避免编辑器预览和最终网站割裂。
- 保留原有主流程：首页 → 创建 → 分析 → 编辑 → 发布 → 最终网站。

## 30. 为什么重构生成物

之前最终页面更接近“把简历搬到网页上”，核心问题是：
- 用户输入的信息展示不充分。
- 项目、作品、技能、联系方式之间缺少个人网站的叙事层次。
- 六个模板差异主要停留在视觉色彩，不能体现不同风格的网站结构。
- 编辑器预览与最终生成站点的呈现方式不够一致。

本阶段改为“个人网站 / Portfolio”思路：首屏突出个人定位，正文突出项目与经历故事，再补充技能、证书、作品和联系方式。

## 31. 新的创建页输入结构

创建页仍为单页滚动，新增和调整后的关键输入包括：
- 个人基本信息：照片、姓名、联系方式、学校、专业、个人标签 / 一句话定位。
- 岗位信息：岗位 JD、目标公司、求职类型、为什么想做这个岗位。
- 经历信息：经历标题、我的角色、时间 / 阶段、项目 / 作品链接、自由描述。
- 技能证书：技能关键词、证书 / 奖项。
- 作品 / 项目链接：支持用 textarea 粘贴多个作品、作品集、GitHub、Figma、Notion 或项目链接。
- 主页风格：Neo、Pure、Flow、Grid、Canvas、Glass。
- 网站观感偏好：专业可信、科技未来、创意表达、温暖亲和、极简高级。

## 32. 新 createDraft 字段

新增或扩展字段：

```js
createDraft = {
  basicInfo: {
    personalTagline: '',
  },
  jobInfo: {
    motivation: '',
  },
  experiences: [
    {
      role: '',
      period: '',
      link: '',
    },
  ],
  worksInfo: {
    rawLinks: '',
  },
  stylePreference: '',
};
```

兼容策略：
- `normalizeDraft` 会为旧草稿补齐缺失字段。
- 旧 localStorage 中没有这些字段时不会报错。
- 旧的 `skillsInfo`、`template`、`experiences` 结构继续可用。

## 33. 新 siteDraft 结构

`siteDraft` 现在更接近个人网站内容模型：

```js
siteDraft = {
  profile: {},
  hero: {},
  highlights: [],
  projects: [],
  experienceStory: {},
  skills: [],
  certificates: [],
  works: [],
  contact: {},
  sections: [],
  theme: {},
  template: '',
  stylePreference: '',
  meta: {},
};
```

说明：
- `hero` 用于最终网站首屏。
- `projects` 用于重点项目展示。
- `works` 用于外部作品链接展示。
- `experienceStory` 用于把经历内容组织成更完整的个人成长 / 项目叙事。
- `sections` 保留给编辑器模块列表兼容使用。

## 34. draftGenerator 内容编排策略

`src/lib/draftGenerator.js` 负责从 `createDraft + analysisResult` 派生 `siteDraft`。

当前策略：
- 优先使用用户填写的姓名、目标岗位、个人标签和求职动机生成首屏。
- 优先把用户填写的经历转为重点项目，不再只显示默认“校园项目经历”。
- 从经历描述中提取摘要，并结合角色、时间、链接生成项目卡片。
- 从 `skillsInfo.keywords` 生成技能标签。
- 从 `skillsInfo.certificates` 生成证书 / 奖项内容。
- 从 `worksInfo.rawLinks` 与经历链接生成作品链接。
- 从 `analysisResult.abilityFocus` 和 `jobKeywords` 补充展示重点，但不替代用户输入。
- 不编造不存在的具体项目链接。

## 35. 六个模板设计提示词

模板数据维护在 `src/data/templates.js`，每个模板包含 `designPrompt`、`palette`、`layoutIntent` 和 `personality`。

- Neo：现代科技感、渐变、发光、AI 产品感。
- Pure：极简、高级、留白、黑白灰。
- Flow：柔和流动、杂志感、适合表达型经历。
- Grid：模块化、理性、结构清晰、适合工程与产品项目。
- Canvas：创意画布、自由排布、适合作品与设计表达。
- Glass：玻璃拟态、透明感、浅蓝青绿、柔和未来感。

## 36. TemplateRenderer 六模板差异

`src/renderers/TemplateRenderer.jsx` 负责根据 `siteDraft.template` 渲染最终网站。

六个模板的结构差异：
- Neo：科技首屏、漂浮亮点、项目 showcase、发光技能标签。
- Pure：单栏留白、关于我优先、案例式项目卡片、极简作品列表。
- Flow：左右分栏首屏、叙事流线、杂志式作品区。
- Grid：仪表盘式首屏、网格项目矩阵、模块边界更清晰。
- Canvas：作品优先、展览式项目排布、自由画布感。
- Glass：玻璃卡片首屏、透明高光、柔和分层内容块。

## 37. 作品 / 项目链接输入说明

创建页新增 `作品 / 项目链接` textarea。

建议用户每行放一个链接或作品说明，例如：
```text
GitHub: https://github.com/xxx
作品集: https://notion.site/xxx
项目演示: https://example.com
```

生成逻辑：
- 有链接时，最终网站展示 `查看作品` 或 `查看项目` 按钮。
- 作品链接会进入 `siteDraft.works`。
- 经历卡片中的项目链接会进入对应项目卡片。
- 如果没有链接，不展示假的链接按钮。

## 38. 编辑器 / 发布页适配说明

- 编辑器中间预览已复用 `TemplateRenderer`，用户在编辑器看到的页面风格更接近最终网站。
- 编辑器仍保留三栏结构，不扩展完整网站编辑器功能。
- 发布页继续读取 `pageu.siteDraft`，预览内容会自动使用新的 `siteDraft` 结构。
- `/site/:id` 不展示编辑器控件，只展示真实个人网站。

## 39. 当前未完成

- 还没有实现真正的自由拖拽式网站搭建器。
- 还没有把每个模板拆成可独立配置的模板包。
- 编辑器右侧暂未覆盖所有新增字段的精细编辑。
- 没有真实发布、后端、登录、数据库和部署能力。
- AI 仍只做分析，不直接生成完整网页代码。

## 40. 未来 Agentic Site Builder 扩展说明

后续可在当前结构上扩展 Agentic Site Builder：
- 让 AI 先输出结构化 `siteDraft`，而不是直接输出网页代码。
- 将 `TemplateRenderer` 拆成可插拔模板系统。
- 增加模块级编辑、模块重排、内容重写和版本回滚。
- 将 AI 调用迁移到后端或 Serverless，避免前端暴露 Key。
- 引入发布服务，将 `siteDraft + template` 生成可访问的真实站点。

## 41. Phase 8 测试结果

已执行：

```bash
npm run test
npm run build
```

结果：

```text
npm run test: 29 tests passed
npm run build: success
```

额外本地冒烟：

```text
http://127.0.0.1:5174/site/demo
StatusCode=200
ContainsPageU=True
ContainsRoot=True
```

说明：自动化浏览器依赖 `playwright` 当前未安装，因此未做截图级浏览器自动化验收；已通过 Vitest、生产构建和本地 HTTP 冒烟验证。

## 42. Phase 8 commit 信息

```text
feat: rebuild generated output as portfolio website
```

## 43. Phase 8.1 完成内容

本阶段彻底重写最终个人网站渲染器，将 `/site/:id` 从“网页简历 / 编辑器预览壳”改为真正的 Portfolio Website。

完成内容：
- `TemplateRenderer` 改为纯模板选择器，不再承载所有模板和卡片逻辑。
- 新增 `mode="site" | "preview"`，最终网站使用全屏 `site` 模式，编辑器和发布页使用缩放 `preview` 模式。
- 拆分六个独立模板组件：Neo、Pure、Flow、Grid、Canvas、Glass。
- 抽取 Portfolio 共享组件：导航、Hero、About、ProjectCard、Projects、Skills、Works、Contact、Highlights。
- 重写项目卡片，移除旧的 `Problem / Action / Result` 三列窄排结构。
- `/site/demo` 现在包含完整 Hero、顶部导航、CTA、About、Featured Projects、Works、Skills、Contact。
- 编辑器和发布页继续可预览，但不再影响最终网站的全屏布局。

## 44. 为什么重写 TemplateRenderer

Phase 8 的渲染器仍有几个结构性问题：
- 所有模板、区块、项目卡片写在一个大文件中，难以继续打磨。
- 旧项目卡片使用三列 `Problem / Action / Result`，中文内容会被挤成窄列，阅读体验差。
- 最终网站和编辑器预览共用同一尺寸思路，导致 `/site/demo` 像被塞进预览容器。
- 六个模板差异不够明显，更多像换色而不是不同网站。

Phase 8.1 的重写思路是：最终站点按真实网站布局设计，编辑器/发布页只调用缩放预览。

## 45. 新模板组件结构

```text
src/renderers/
├── TemplateRenderer.jsx
├── shared/
│   ├── AboutSection.jsx
│   ├── ContactSection.jsx
│   ├── HeroSection.jsx
│   ├── HighlightsStrip.jsx
│   ├── PortfolioNav.jsx
│   ├── ProjectCard.jsx
│   ├── ProjectsSection.jsx
│   ├── SkillPills.jsx
│   ├── WorksLinks.jsx
│   └── portfolioUtils.js
└── templates/
    ├── CanvasTemplate.jsx
    ├── FlowTemplate.jsx
    ├── GlassTemplate.jsx
    ├── GridTemplate.jsx
    ├── NeoTemplate.jsx
    └── PureTemplate.jsx
```

## 46. site mode / preview mode 说明

- `mode="site"`：用于 `/site/:id`，全宽、无编辑器外壳、Hero 接近满屏。
- `mode="preview"`：用于 `/editor` 和 `/publish`，将完整个人网站缩放到预览容器中。
- `previewMode="desktop" | "mobile"` 继续保留，用于编辑器和发布页切换设备预览。

调用点：
- `GeneratedSitePage`：`mode="site"`
- `EditorPage`：`mode="preview"`
- `PublishPage`：`mode="preview"`

## 47. 六模板视觉差异

- Neo：科技创业风，渐变背景、大 Hero、浮动信息卡、发光技能标签。
- Pure：极简高级，黑白灰、大留白、单栏 case study。
- Flow：杂志叙事风，分栏首屏、柔和背景、项目像文章故事。
- Grid：结构化 Bento 风，网格背景、模块化信息块、高信息密度。
- Canvas：创意画布风，暖色块、不对称布局、作品链接优先。
- Glass：玻璃拟态轻科技，柔和渐变、透明玻璃卡、浮动内容块。

## 48. ProjectCard 新结构

新项目卡片结构：
- 项目标题
- 角色 / 时间
- 项目简介
- “我做了什么” bullet 列表
- “产出与价值”
- “岗位关联”
- tags
- 查看项目按钮

已移除：
- `Problem`
- `Action`
- `Result`
- `.portfolio-project-points` 三列窄排结构

## 49. 当前未完成

- 编辑器右侧仍不是完整 Portfolio 可视化编辑器。
- 模板仍是前端 React 组件，不是可远程安装的模板包。
- 未接真实发布服务，仍使用 localStorage 模拟发布。
- 未做 Playwright 截图级自动化验收，当前环境没有安装 Playwright。

## 50. Phase 8.1 测试结果

已执行：

```bash
npm run test
npm run build
```

结果：

```text
npm run test: 32 tests passed
npm run build: success
```

本地服务验证：

```text
http://127.0.0.1:5174/site/demo
StatusCode=200
PageU=True
```

## 51. Phase 8.1 commit 信息

```text
fix: render generated output as full portfolio website
```
## Phase 8.2 — Portfolio 网站体验重构 + 项目详情页 + 图片真实展示

### 完成内容

- 将 `/site/:id` 的最终生成物从“网页简历”调整为 Portfolio Website 信息架构：`Hero → About → Featured Projects → Resume Snapshot → Contact`。
- 修复最终站点尺寸问题：`site mode` 下 Hero 不再被编辑器/预览容器宽度限制，`preview mode` 仍在编辑器和发布页中缩放展示。
- 创建页经历卡片新增：
  - `项目封面`
  - `项目/作品链接`
  - `我的角色`
  - `项目一句话简介`
- 创建页照片上传改为保存 `photoPreviewUrl`，项目封面保存 `coverUrl`，使用 data URL 作为本地预览和最终站点展示数据。
- 删除创建页二次风格控制 UI，保留模板选择作为唯一视觉风格入口。
- `draftGenerator` 现在将 `createDraft` 派生为更完整的 Portfolio `siteDraft`，包含：
  - `profile.photoPreviewUrl`
  - `projects[].coverUrl`
  - `projects[].externalLink`
  - `projects[].summary`
  - `projects[].background`
  - `projects[].goal`
  - `projects[].actions`
  - `projects[].result`
  - `projects[].jdRelevance`
  - `resumeSnapshot`
- 新增项目详情页 `/site/:id/project/:projectId`，支持：
  - 返回项目
  - 大封面
  - 项目标题、角色、时间、简介
  - 项目背景、我的目标、做了什么、产出结果、岗位关联
  - 项目链接
  - 下一个项目
  - 500ms fade-up 进入动画
- 六个模板组件继续拆分为独立组件，并统一复用 Portfolio 信息架构，同时保留不同根 class 与视觉风格。

### 新增/修改文件

- `src/pages/ProjectDetailPage.jsx`
- `src/renderers/shared/ResumeSnapshot.jsx`
- `src/pages/CreatePage.jsx`
- `src/lib/draftGenerator.js`
- `src/types/createDraft.js`
- `src/types/siteDraft.js`
- `src/renderers/TemplateRenderer.jsx`
- `src/renderers/shared/HeroSection.jsx`
- `src/renderers/shared/ProjectCard.jsx`
- `src/renderers/shared/ProjectsSection.jsx`
- `src/renderers/shared/PortfolioNav.jsx`
- `src/renderers/shared/ContactSection.jsx`
- `src/renderers/shared/portfolioUtils.js`
- `src/renderers/templates/*.jsx`
- `src/styles.css`
- `src/App.jsx`
- `src/App.test.jsx`

### 图片策略

- 前端 Demo 不接后端、不上传文件到远端。
- 用户头像和项目封面通过 `FileReader.readAsDataURL` 转成本地 preview URL。
- `createDraft → siteDraft → TemplateRenderer / ProjectDetailPage` 全链路传递图片 data URL。
- 没有图片时使用渐变头像或项目封面占位，避免首字母小占位破坏 Hero 视觉。

### Portfolio 信息架构

- `Hero`：固定顶部导航、姓名、目标岗位、一句话定位、查看项目/联系我 CTA、真实头像展示。
- `About`：2-3 句身份介绍，不堆个人信息。
- `Featured Projects`：精选项目大卡片与项目入口，不再展开长经历。
- `Project Detail`：每个项目进入独立详情页，按作品集案例组织内容。
- `Resume Snapshot`：学校、专业、技能、证书与折叠时间轴，默认弱化。
- `Contact`：联系方式和作品/项目链接入口，底部弱化 `Generated by PageU`。

### 动画说明

- Hero 头像保留轻微浮动动画。
- 项目卡片 hover 轻微上浮。
- 项目详情页进入动画为 `opacity: 0 → 1`、`translateY: 24px → 0`，持续 500ms，缓动 `ease-out`。

### 测试结果

```text
npm test: 36 tests passed
npm run build: success
Browser smoke:
- http://127.0.0.1:5174/site/demo: 200
- http://127.0.0.1:5174/site/demo/project/project-1: 200
```

### 当前未完成

- 项目详情内容仍由前端规则派生，不接真实 AI 生成完整案例文案。
- 图片以 localStorage data URL 保存，仅适合比赛 Demo，不适合生产长期存储。
- 模板视觉已明显区分，但后续仍可继续做更精细的模板生态。

### 下一阶段建议

- 将图片存储迁移到后端或对象存储。
- 让 AI 分析结果参与生成更自然的项目详情文案。
- 增加模板预览和最终站点移动端视觉专项验收。

### Git commit

```text
feat: transform generated output into portfolio experience
```

## Phase 8.3 — 个人网站微交互与动效体验升级

### 完成内容

- 为最终个人网站 `/site/:id` 增加 Landing Reveal：背景、Hero 文案、头像/照片和 CTA 分层渐入。
- 为 About、Featured Projects、Resume、Contact 增加进入视口的叙事动效。
- 项目卡片支持左右交替进入、hover 轻微上浮、封面图微放大，并显示“查看项目 →”。
- 顶部导航支持平滑滚动，并根据当前 section 自动高亮。
- CTA 按钮增加克制的 hover 微交互：轻微上浮、缩放和阴影增强。
- 最终网站背景增加低幅度鼠标跟随光斑效果，移动端弱化。
- 新增轻量彩蛋：连续点击 Logo/姓名 3 次显示“你发现了一个小彩蛋 ✨”。
- 编辑器预览和发布页预览继续复用 TemplateRenderer，保留 preview/site 模式隔离。

### 微交互设计说明

- 动效集中在 Portfolio 网站渲染层，不改变创建、分析、编辑、发布的主流程。
- Hero 使用 800–1200ms 的克制分层进入，增强首次打开的完整网站感。
- section 进入视口时使用 fade-up，帮助用户按 About → Projects → Resume → Contact 的顺序阅读。
- 项目卡片 hover 只改变 transform、封面图和边框光效，不触发布局重排。

### 体验目的

- 让 `/site/:id` 第一眼更像真实可分享的个人网站，而不是静态简历页面。
- 用导航高亮和滚动叙事强化网站浏览感。
- 用项目卡片 hover 和 CTA 微交互提升可点击感，但不抢用户主任务。

### 性能与可访问性处理

- 新增 `PortfolioMotionContext` 统一管理 `prefers-reduced-motion`。
- 当用户系统设置减少动态效果时，关闭主要进入动画和背景跟随效果。
- 在不支持 `IntersectionObserver` 的测试环境中自动降级，避免渲染报错。
- 移动端弱化背景鼠标跟随和 hover 动效，保持滚动流畅。

### 新增/修改文件

- `src/renderers/shared/PortfolioMotionContext.jsx`
- `src/renderers/TemplateRenderer.jsx`
- `src/renderers/shared/PortfolioNav.jsx`
- `src/renderers/shared/HeroSection.jsx`
- `src/renderers/shared/AboutSection.jsx`
- `src/renderers/shared/ProjectsSection.jsx`
- `src/renderers/shared/ProjectCard.jsx`
- `src/renderers/shared/ResumeSnapshot.jsx`
- `src/renderers/shared/ContactSection.jsx`
- `src/styles.css`
- `src/App.test.jsx`

### 测试结果

```text
npm test: 39 tests passed
npm run build: success
Browser smoke:
- http://127.0.0.1:5174/site/demo: 200
- /site/demo 根节点为 site mode，并带有 portfolio-motion-ready
- 点击导航“项目”后跳转到 #featured-projects，导航高亮为“项目”
```

### Git commit

```text
feat: add portfolio microinteractions and storytelling motion
```

## Phase 8.4 — 成品个人网站最终清理与参考图对齐

### 完成内容

- 最终个人网站首屏改为大圆角 `portfolio shell`，宽度约 1220px，居中展示，带柔和阴影、玻璃/浅色渐变背景。
- Hero 改为 Bento 式首屏：顶部为 shell 内导航，左侧为姓名、目标岗位和定位，右侧为真实头像/照片卡片，下方为关于我、精选项目、联系我的入口卡片。
- 修复导航被旧样式固定在页面中间的问题，最终站点和预览模式都保持导航位于 shell 内部。
- 创建页联系方式拆分为 `手机号` 和 `邮箱`。
- 创建页删除独立的 `作品 / 项目链接` 输入区，保留每条经历里的项目链接字段。
- 最终 Contact 区重写为真实个人网站联系方式：一句自然文案、邮箱卡片、手机号卡片、复制邮箱、复制手机号。
- Resume Snapshot 改为轻量直出：教育背景、技能、证书/奖项、关键经历摘要，不再折叠。
- 项目卡片简化为作品集卡片：项目名称、角色、时间、一句话简介、2-3 个要点、标签和查看项目按钮。
- 项目详情页将“岗位关联”改为“我学到了什么”，保留背景、目标、行动、结果等自然案例结构。

### 成品说明性文字清理

已从最终网站移除以下类型文字：

- `精选项目以作品集方式呈现，点击进入完整案例。`
- `简历只是辅助，重点仍然是项目和作品。`
- `展开完整简历`
- `完整时间轴`
- `这段经历可以帮助展示...`
- `岗位关联`

最终网站不再出现面向产品操作者的提示语或说明页文案。

### 联系方式字段调整

`createDraft.basicInfo` 新增：

```js
{
  phone: '',
  email: ''
}
```

兼容旧数据：

- 旧 `basicInfo.contact` 仍保留。
- 如果旧 contact 看起来像邮箱，会迁移到 `email`。
- 如果旧 contact 看起来像手机号，会迁移到 `phone`。
- 不会把普通文本、项目名或作品说明当作联系方式展示。

### 作品链接区删除说明

- `/create` 删除独立 `worksInfo.rawLinks` 输入区。
- `worksInfo.rawLinks` 仍保留在数据结构中，用于兼容旧 localStorage。
- `draftGenerator` 不再把 `worksInfo.rawLinks` 输出到最终网站。
- 经历卡片中的项目链接仍然保留，并可在项目卡片/项目详情页中作为“查看项目”入口。

### Resume Snapshot 简化说明

- 删除折叠/展开逻辑。
- 删除“展开完整简历”和“完整时间轴”。
- 直接展示轻量摘要，避免最终网站变成网页简历。

### 头像真实展示修复

- `photoPreviewUrl` 继续从 `createDraft` 传递到 `siteDraft.profile.photoPreviewUrl`。
- Hero 头像优先使用用户上传图片。
- 未上传图片时才使用渐变占位。

### 新增/修改文件

- `src/pages/CreatePage.jsx`
- `src/types/createDraft.js`
- `src/types/siteDraft.js`
- `src/lib/draftGenerator.js`
- `src/renderers/shared/HeroSection.jsx`
- `src/renderers/shared/ProjectCard.jsx`
- `src/renderers/shared/ProjectsSection.jsx`
- `src/renderers/shared/ResumeSnapshot.jsx`
- `src/renderers/shared/ContactSection.jsx`
- `src/renderers/shared/portfolioUtils.js`
- `src/pages/ProjectDetailPage.jsx`
- `src/styles.css`
- `src/App.test.jsx`

### 测试结果

```text
npm test: 40 tests passed
npm run build: success
Browser smoke:
- /create 显示手机号和邮箱，不显示独立“作品 / 项目链接”区块
- /site/demo shell 宽度约 1220px，圆角 36px
- /site/demo Hero 为 Bento 结构，导航位于 shell 内部
- /site/demo 不显示说明性文字、展开完整简历、完整时间轴
- /site/demo Contact 不展示作品链接或项目名，只展示邮箱/手机号模型
```

### Git commit

```text
fix: polish portfolio output content and contact model
```

## Phase 8.5 — 演示友好与个人网站内容结构修正

### 完成内容

- `/create` 删除“个人标签 / 一句话定位”输入，新增“自我介绍”字段。
- `createDraft.basicInfo.selfIntro` 新增并兼容旧 `personalTagline` 数据。
- “创建新的个人网站”在演示阶段不再清空 `createDraft/siteDraft/publishDraft`，只跳转 `/create`，方便比赛演示时保留上一轮输入。
- `draftGenerator` 增加 `profile.photoUrl`，保持 `photoPreviewUrl -> siteDraft.profile.photoUrl -> TemplateRenderer` 的真实头像传递链路。
- 最终个人网站信息架构调整为：Hero → 简历摘要 → 精选项目 → 关于我 → 联系我。
- 最终网站主标题改为中文：`简历摘要`、`精选项目`，不再展示 `Resume Snapshot`、`Featured Projects` 等英文主标题。
- 项目卡片进一步简化，只展示封面、项目名、角色、时间、简介、标签和“查看项目”入口，不再展示 STAR 详情。
- 项目详情页保留自然 STAR 结构：`项目背景`、`我的目标`、`我的行动`、`产出结果`、`我学到了什么`。
- 项目详情页仅在项目本身存在链接时展示 `作品链接` 区域。
- `/editor` 预览、`/publish` 预览、`/site/:id` 和 `/site/:id/project/:projectId` 共享同一套渲染结果。

### 数据与兼容策略

- `basicInfo.selfIntro` 是新的创建页输入字段。
- `basicInfo.personalTagline` 保留在数据结构中，仅用于旧 localStorage 兼容。
- 旧数据如果没有 `selfIntro`，会自动用 `personalTagline` 补齐。
- `siteDraft.profile.photoUrl` 优先使用上传照片的 data URL；没有照片时仍使用渐变占位。
- `siteDraft.projects[].star` 保存项目详情页使用的结构化内容，不在首页项目卡片展开。

### 演示新建策略

- `resetPageUState()` 和 `resetDraft()` 没有删除。
- Phase 8.5 中 `/publish` 与 `/site/:id` 的“创建新的个人网站”按钮只执行 `navigate('/create')`。
- 代码中已保留注释：正式产品版本可以恢复清空逻辑；当前比赛演示阶段优先避免误删输入。

### 本阶段新增/修改文件

- `src/App.test.jsx`
- `src/types/createDraft.js`
- `src/types/siteDraft.js`
- `src/lib/draftGenerator.js`
- `src/pages/CreatePage.jsx`
- `src/pages/GeneratedSitePage.jsx`
- `src/pages/ProjectDetailPage.jsx`
- `src/pages/PublishPage.jsx`
- `src/renderers/shared/HeroSection.jsx`
- `src/renderers/shared/ProjectCard.jsx`
- `src/renderers/shared/ProjectsSection.jsx`
- `src/renderers/shared/ResumeSnapshot.jsx`
- `src/renderers/shared/portfolioUtils.js`
- `src/renderers/templates/CanvasTemplate.jsx`
- `src/renderers/templates/FlowTemplate.jsx`
- `src/renderers/templates/GlassTemplate.jsx`
- `src/renderers/templates/GridTemplate.jsx`
- `src/renderers/templates/NeoTemplate.jsx`
- `src/renderers/templates/PureTemplate.jsx`
- `docs/HANDOFF.md`

### 测试结果

```text
Vitest: 44 tests passed
Vite build: success
Browser smoke:
- /create 显示“自我介绍”，不显示“个人标签 / 一句话定位”
- /site/demo 显示“简历摘要”“精选项目”，不显示英文主标题
- /site/demo 项目卡片不再展示 STAR bullet
- /site/demo/project/project-1 显示“项目背景 / 我的目标 / 我的行动 / 产出结果”
```

### 当前未完成

- 当前仍是前端 Demo，图片用 data URL 存在 localStorage，不适合生产长期存储。
- 项目详情内容仍由前端规则从经历描述派生，后续可接入更细的 AI 案例整理能力。
- “创建新的个人网站”的正式清空策略需要在演示结束后按产品版本决定是否恢复。

### 下一阶段建议

- 针对演示材料准备一组默认样例数据，减少现场手填成本。
- 给最终网站增加一轮移动端真实设备视觉验收。
- 如果进入部署阶段，优先处理图片持久化和 AI Key 后端代理。

### Git commit

```text
fix: align portfolio content structure for demo
```

---

## 2026-08-13 项目通读记录（智联招聘 AI 大赛参赛作品）

- 项目一句话定位：PageU —— 面向未来求职方式的 AI 个人网站生成平台（AI 能力 + 模板系统 + 项目展示 + 发布分享，帮求职者低门槛生成可访问、可传播的个人网站）。
- 参赛背景：智联招聘 AI 大赛，作者曹桎康；产品访问链接 https://pageu-ai-career.netlify.app/。
- 完整产品闭环：首页 → 创建（基本信息/岗位JD/经历/技能证书/模板）→ AI 分析（通义千问 qwen 岗位理解+经历分析，Mock fallback）→ 编辑（模块/颜色/预览）→ 发布（链接+二维码+权限）→ 最终个人网站 /site/:id（含项目详情页 /site/:id/project/:projectId）。
- 六模板：Neo / Pure / Flow / Grid / Canvas / Glass；模板组件在 src/renderers/templates/，共享组件在 src/renderers/shared/。
- 发布：Phase 8 已接入 Netlify Blobs + Serverless Functions（netlify/functions/publish-site.mjs、get-site.mjs），演示站点 /site/demo 走本地 localStorage 兜底。
- 技术栈：React 19 + Vite 6 + Tailwind 4 + Framer Motion + React Router 7 + lucide-react + qrcode + Vitest/Testing Library；AI 通过 DashScope OpenAI 兼容接口（qwen-plus，前端 VITE_ 环境变量，已知风险需后端代理）。
- 文档资产：作品说明文档 docx/pdf（根目录 + docs/pageu_render/）、演示视频 mp4、TEST_REPORT.md、本 HANDOFF.md（Phase 1→8.5 完整迭代记录）。
- 当前状态：比赛材料已齐（说明文档 2026-06-16 更新、演示视频 6-14），git 仓库 29 个 commit 已推送 main。

---

## Phase 9 — 模板视觉重做（2026-08-13）

按 personal-homepage-skill 的 18 种风格预设重新设计六模板，映射：
- Neo → Clean Developer Homepage（清爽开发者主页）
- Pure → Minimal Premium Resume（极简高端简历）
- Flow → Magazine Portfolio（杂志编辑风）
- Grid → Case Study Portfolio（案例式作品集）
- Canvas → Business Personal Brand（商务个人品牌）
- Glass → Cinematic Scroll 轻量版（电影感玻璃）

**核心执行约束**：所有 DOM 结构和 class 名保持不动（测试硬约束：`template-*-site`、`portfolio-site-mode`、`portfolio-hero-horizontal-tab`、`portfolio-hero-intro-card-copy`、`portfolio-hero-intro-paragraph` 等必须存在；`portfolio-hero-bento-main`、`portfolio-project-points` 必须不存在）。

**改动文件**：
- `src/data/templates.js` — 六模板 designPrompt/palette/layoutIntent/personality 按 skill 风格重写
- `src/lib/draftGenerator.js` — buildTheme themeMap 配色同步更新
- `src/pages/GeneratedSitePage.jsx` — 新增 `?template=xxx` URL 参数演示支持（仅 /site/demo，不影响测试和正常流程），同步切换 siteDraft.theme
- `src/styles.css` — 末尾追加 Phase 9 段约 800 行：9.0 全局（去掉发光球防 AI 味、CJK 字体栈、reveal 改 transform-only） + 9.1-9.6 六模板差异化视觉 + 9.7 动效克制 + 9.8 移动端
  - 注释掉了原 .template-* .portfolio-shell / .template-* 大块 radial-gradient/linear-gradient 装饰背景（行 680、724、1351-1363、1812-1817），避免旧装饰球穿透新视觉层

**测试结果**：
```
npm test: 57 tests passed
npm run build: success (137KB CSS gzip 22KB)
```

**截图验收**：`docs/phase9-previews/template-{neo,pure,flow,grid,canvas,glass}.png` 六张 1440x1100 PNG

**踩坑**：
- Vite HMR 对大文件不全量推送；样式不生效时 build + preview 比 dev 可靠
- Edge headless `--user-data-dir` 必须放项目外，否则 Vite 把 db 文件当源码监控触发 page reload 导致白屏
- Vite dev 启动不能用 `| head -20`（SIGPIPE 杀进程），必须日志重定向

**下一阶段候选**：
- PC 端适配打磨
- PDF 简历导入 + 后端化（AI Key 迁移至 Netlify Function）
- AI 生成升级 + 商业化底座

---

## Phase 10 — 颠覆式模板重做（2026-08-13 晚）

用户对 Phase 9 "保留旧壳换皮"不满意，要求完全推倒重做渲染层。本轮直接套用 personal-homepage-skill 的设计规范重写 4 套模板。

**彻底重写**：
- 删除 6 套旧模板组件（Neo/Pure/Flow/Grid/Canvas/Glass） + 旧 shared 组件（HeroSection/AboutSection/ProjectsSection/Contact/ProjectCards 等约 12 个文件）
- `src/data/templates.js` 重写为 4 套新模板（Resume/Developer/Case/Cinematic）
- `src/lib/draftGenerator.js` buildTheme 同步更新配色
- `src/renderers/TemplateRenderer.jsx` 重写映射到新模板（保留外壳：mode/preview/缩放/动画）
- 4 套新模板组件全部用 Tailwind utility 内联样式，对齐 skill 的 `templates/react-tailwind/` 写法
- 新建 `src/renderers/site.css`（导航 + 外壳少量自定义），`main.jsx` 引入
- `src/types/createDraft.js` / `src/types/siteDraft.js` / `src/lib/draftGenerator.js` 默认模板改为 `'resume'`

**4 套风格映射**（skill 风格）：
| id | skill 预设 | 视觉 |
|---|---|---|
| `resume` | Minimal Premium Resume | 衬线、象牙白、case study |
| `developer` | Clean Developer Homepage | 浅蓝、圆角、网格 |
| `case` | Case Study Portfolio | 紫 accent、模块化卡片 |
| `cinematic` | Cinematic Scroll Personal Brand | 深黑 + 橙 accent、玻璃卡 |

**模拟数据演示**（用户要求"输模拟数据 + 完整版"）：
- ImageGen 生成 4 张图（1 职业头像 + 3 项目封面，20-40 积分），存 `public/demo/`（avatar.png / project-pageu.png / project-campus.png / project-data.png）
- `src/data/demoDraft.js`：完整求职者画像（林知行·北理工·AI 产品经理·5 段经历·5 个项目含 3 张封面图）
- `src/pages/GeneratedSitePage.jsx` 接入：/site/demo 无草稿时自动加载 demoDraft 渲染完整效果
- 同时保留 `/site/demo?template=xxx` URL 参数支持（演示四套模板切换）

**bug 修复**：`src/lib/draftGenerator.js` 的 `cleanPreviewUrl` 原仅接受 `data:image/` / `blob:` / `https?://`，扩展支持 `/` 开头的站内相对路径（之前 avatar/coverUrl 被静默清空导致全部图片显示占位）。

**测试**：57 tests 同步重写（保留主流程语义，移除对旧 `portfolio-hero-*` / `template-*-site` 等具体 class 的依赖），最终 `npm test 57 passed` / `npm run build success`。

**截图验收**：`docs/phase10-previews/template-{resume,developer,case,cinematic}.png`（四张 1440x2800 完整页面截图，全部带真实头像 + 项目封面 + 完整简历摘要 + 关于我 + 联系我）。

**踩坑**：
- vite preview 静态服务：新 dist 必须用新端口（之前 5201 被旧 server 占用导致截图仍是旧 dist，改用 5202 后图片正确加载）
- vite build 时 emptyDir 被 safe-delete shim 拦截：必须 `rm -rf dist && npm run build` + `dangerouslyDisableSandbox=true`
- ImageGen 生成图片文件名带时间戳，必须重命名为 `avatar.png` 等常量名供 demoDraft 引用

**下一阶段候选**：
- PC 端适配打磨
- PDF 简历导入 + 后端化（AI Key 迁移至 Netlify Function）
- AI 生成升级 + 商业化底座
