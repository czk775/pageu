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
