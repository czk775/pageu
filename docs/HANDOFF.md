# PageU 项目交接文档

## 1. 当前阶段名称

Phase 7 — 接入真实 AI（阿里百炼 / 通义千问 / DashScope OpenAI 兼容接口）。

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
