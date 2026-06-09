# PageU 项目交接文档

## 1. 当前阶段名称

Phase 6 — 代码结构整理 + 体验打磨。

## 2. Phase 6 完成内容

- 在不改变主流程的前提下完成页面拆分。
- `App.jsx` 已瘦身为 Provider + 路由配置，当前约 22 行。
- 新增 `src/pages/`，承载首页、创建页、分析页、编辑器、发布页和最终网站页。
- 新增 `src/components/`，承载动态背景、小U 光团助手、主按钮、玻璃卡、模板卡和统一 toast。
- 新增 `src/lib/storage.js`，统一处理 `localStorage` JSON 读写、`siteDraft` 读取、`publishDraft` 读取和保存。
- 小U 光团助手统一由 `FloatingAssistant.jsx` 控制。
- 发布页复制链接后显示统一 toast：`已复制链接`。
- 发布页下载二维码后显示统一 toast：`二维码已下载`。
- 编辑器保存完成后保留原有 `已保存` 状态，同时补充 `保存成功` toast。
- 分析页重新分析完成后使用统一 toast 展示 `已根据你的补充重新整理理解`。
- 保留现有完整链路：首页 → 创建 → 分析 → 编辑 → 发布 → 最终网站。
- 保留 Phase 5 的发布页、二维码、模拟发布状态和最终个人网站渲染能力。

## 3. 技术栈

- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- lucide-react
- qrcode
- Vitest + Testing Library

## 4. 新的文件结构

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
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 5. 组件说明

- `DynamicBackground.jsx`：全局动态科技感背景。
- `FloatingAssistant.jsx`：统一小U 光团助手，控制文案、位置和漂浮动画。
- `PrimaryButton.jsx`：主操作按钮，可作为按钮或链接使用。
- `GlassCard.jsx`：轻量玻璃卡片容器，保持页面视觉一致。
- `TemplateCard.jsx`：创建页模板单选卡片。
- `StatusToast.jsx`：统一轻提示组件，使用 `role="status"`。
- `FormField.jsx`：创建页和编辑器复用的表单字段容器。

## 6. 页面说明

- `HomePage.jsx`：首页，只保留产品名、主标题、立即创建、小U 和动态背景。
- `CreatePage.jsx`：创建页，维护输入体验和模板选择。
- `AnalyzePage.jsx`：Mock AI 分析页，不接真实 AI。
- `EditorPage.jsx`：三栏网站草稿编辑器，继续使用 `siteDraft`。
- `PublishPage.jsx`：模拟发布页，包含预览、链接、二维码、访问权限和 toast。
- `GeneratedSitePage.jsx`：最终个人网站页，读取 `siteDraft` 并交给 `TemplateRenderer`。

## 7. 状态与存储

### createDraft

`createDraft` 由 `src/state/CreateDraftContext.jsx` 提供，用于保存创建页输入。

### analysisResult

`analysisResult` 由 `src/types/analysisResult.js` 中的 `createAnalysisResult(createDraft, userAdjustment)` 派生，不调用真实 AI。

### siteDraft

`siteDraft` 由 `src/lib/draftGenerator.js` 中的 `generateSiteDraft(createDraft, analysisResult)` 生成，编辑器继续实时修改，并保存到 `pageu.siteDraft`。

### publishDraft

`publishDraft` 由 `src/types/publishDraft.js` 维护，用于模拟发布状态，并保存到 `pageu.publish`。

### storage.js

`src/lib/storage.js` 当前负责：

- `readJsonStorage`
- `writeJsonStorage`
- `loadSiteDraft`
- `saveSiteDraft`
- `loadPublishDraft`
- `savePublishDraft`
- `toSvgDataUrl`
- `PUBLIC_SITE_PATH`

## 8. 本阶段未改变的功能

- 未改变产品主流程。
- 未改变路由地址：`/`、`/create`、`/analyze`、`/editor`、`/publish`、`/site/:id`。
- 未改变 `createDraft`、`analysisResult`、`siteDraft`、`publishDraft` 的核心结构。
- 未接入真实 AI。
- 未接入后端、数据库、登录或真实部署。
- 未改变发布链接固定为 `/site/demo` 的模拟策略。
- 未改变最终站点由 `TemplateRenderer` 渲染的方式。

## 9. 本阶段体验打磨点

- 复制链接后统一显示 `已复制链接`。
- 下载二维码后统一显示 `二维码已下载`。
- 重新分析完成后统一使用 toast 展示反馈。
- 编辑器保存完成后增加 `保存成功` toast，同时保留原有保存状态文案。
- 小U 光团助手由统一组件维护，页面只传入短提示文案。

## 10. 如何本地运行

```bash
npm install
npm run dev
```

如端口被占用，可使用：

```bash
npm run dev -- --host 127.0.0.1 --port 5199 --strictPort
```

验证命令：

```bash
npm test
npm run build
```

## 11. 如何验收本阶段

1. 执行 `npm test`，确认测试通过。
2. 执行 `npm run build`，确认生产构建成功。
3. 查看 `src/App.jsx`，确认只负责 Provider 和路由。
4. 访问 `/`、`/create`、`/analyze`、`/editor`、`/publish`、`/site/demo`，确认路由仍可访问。
5. 确认每个需要小U 的页面仍显示左下角小U。
6. 在 `/publish` 点击 `复制链接`，确认显示 `已复制链接`。
7. 在 `/publish` 点击底部 `下载二维码`，确认显示 `二维码已下载`。
8. 在 `/editor` 修改标题，确认保存状态仍显示 `正在保存` / `已保存`。
9. 在 `/analyze` 打开调整区并点击 `重新分析`，确认显示重新分析完成提示。
10. 确认最终网站 `/site/demo` 没有编辑器三栏或控制面板。

## 12. 当前未完成内容

- 未接入真实 AI 接口。
- 未接入后端、数据库、登录或真实部署。
- 发布链接固定为 `/site/demo`，没有真实域名。
- 访问权限只保存状态，不做访问拦截。
- 图片上传仍为占位/首字母头像，没有真实图片存储。

## 13. 下一阶段建议

- 可继续拆分 `EditorPage.jsx` 内的模块区、预览区和编辑区。
- 可继续拆分 `PublishPage.jsx` 内的预览、地址、二维码和权限卡片。
- 可为 `TemplateRenderer` 增加更细粒度的模板预览或模板配置。
- 若进入演示冲刺，可补充 Playwright 级别的端到端流程截图验收。

## 14. 已执行的 Git commit 信息

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
