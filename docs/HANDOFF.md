# PageU 项目交接文档

## 1. 当前阶段名称

Phase 4 — 编辑器（Editor / Site Draft）。

## 2. 本阶段完成内容

- 初始化 PageU 前端项目骨架、首页、动态背景、小U 光团助手和基础路由。
- 完成 `/create` 单页滚动创建页，支持基础信息、求职信息、经历卡片和模板选择。
- 建立 `createDraft` 前端状态，通过 Context 统一维护并同步到 `localStorage`。
- 完成 `/analyze` Mock AI 分析页，基于 `createDraft` 派生岗位关键词、能力重点、推荐展示顺序和推荐强调经历。
- 完成 `/editor` 网站草稿编辑器页面。
- 编辑器采用三栏布局：左侧模块区、中间实时预览、右侧编辑区。
- 左侧模块支持模拟排序、隐藏/显示、展开/折叠。
- 中间预览支持电脑/手机切换，点击预览模块可高亮并切换右侧编辑对象。
- 右侧编辑面板支持标题、文字、颜色、背景、模块显示的实时更新。
- 新增 `siteDraft` 数据结构，并从 `createDraft` + `analysisResult` 派生初始网站草稿。
- 新增自动保存，保存到 `localStorage` 的 `pageu.siteDraft`，并显示 `正在保存` / `已保存`。
- 顶部操作支持 `返回分析`、`重新生成`、`发布网站`，发布按钮暂跳转 `/publish`。
- 补充自动化测试，覆盖编辑器渲染、`siteDraft` 生成、发布跳转和自动保存提示。

## 3. 技术栈

- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- lucide-react
- Vitest + Testing Library

## 4. 主要文件结构

```text
.
├── docs/
│   └── HANDOFF.md
├── src/
│   ├── data/
│   │   └── templates.js
│   ├── lib/
│   │   └── draftGenerator.js
│   ├── state/
│   │   └── CreateDraftContext.jsx
│   ├── test/
│   │   └── setup.js
│   ├── types/
│   │   ├── analysisResult.js
│   │   ├── createDraft.js
│   │   └── siteDraft.js
│   ├── App.jsx
│   ├── App.test.jsx
│   ├── main.jsx
│   └── styles.css
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 5. 修改/新增文件列表

- 修改 `src/App.jsx`
- 修改 `src/App.test.jsx`
- 修改 `src/styles.css`
- 修改 `docs/HANDOFF.md`
- 新增 `src/lib/draftGenerator.js`
- 新增 `src/types/siteDraft.js`

## 6. 如何本地运行

```bash
npm install
npm run dev
```

默认访问 Vite 输出的本地地址，通常是 `http://localhost:5173/`。

验证命令：

```bash
npm test
npm run build
```

## 7. 如何验收本阶段

1. 执行 `npm install` 安装依赖。
2. 执行 `npm run dev` 启动项目。
3. 访问 `/editor`，确认页面标题为 `再调整一下，让它更像你`。
4. 确认左下角小U 光团助手存在，提示为 `已经很不错了，再调整一下吧`。
5. 确认页面为三栏结构：模块区、实时预览、编辑区。
6. 在左侧模块区点击模块，确认中间对应区域高亮，右侧显示当前编辑项。
7. 点击模块隐藏/显示，确认预览对应模块同步隐藏或恢复。
8. 点击上移/下移，确认模块顺序和预览顺序同步变化。
9. 在右侧修改 `标题`，确认中间预览标题实时更新。
10. 在右侧修改 `颜色` 和 `背景`，确认预览主题实时更新。
11. 切换 `电脑` / `手机`，确认预览宽度变化。
12. 修改内容后确认页面出现 `正在保存`，随后变为 `已保存`。
13. 刷新 `/editor`，确认 `localStorage` 中的 `pageu.siteDraft` 可恢复草稿。
14. 点击 `返回分析`，确认跳转 `/analyze`。
15. 点击 `重新生成`，确认从当前 `createDraft` 和 `analysisResult` 重新派生草稿。
16. 点击 `发布网站`，确认跳转 `/publish`。
17. 执行 `npm test`，确认测试通过。
18. 执行 `npm run build`，确认生产构建通过。

## 8. 当前状态结构

### createDraft

`createDraft` 由 `src/state/CreateDraftContext.jsx` 提供，当前保存在 React Context 中，并同步到 `localStorage`，用于保存创建页输入。

```js
createDraft = {
  basicInfo: {
    photoName: '',
    name: '',
    contact: '',
    school: '',
    major: '',
  },
  jobInfo: {
    jd: '',
    company: '',
    jobType: '',
  },
  experiences: [],
  template: 'neo',
  meta: {
    version: 1,
    updatedAt: null,
  },
};
```

### analysisResult

`analysisResult` 由 `src/types/analysisResult.js` 中的 `createAnalysisResult(createDraft, userAdjustment)` 派生，不调用真实 AI。

```js
analysisResult = {
  jobKeywords: [],
  abilityFocus: [],
  displayOrder: [],
  highlightedExperiences: [],
  userAdjustment: '',
  updatedAt: '',
};
```

### siteDraft

`siteDraft` 由 `src/lib/draftGenerator.js` 中的 `generateSiteDraft(createDraft, analysisResult)` 生成，编辑器内部继续实时修改该结构。

```js
siteDraft = {
  profile: {
    name: '',
    targetRole: '',
    headline: '',
    intro: '',
    contact: '',
    school: '',
    major: '',
    photoName: '',
  },
  sections: [
    {
      id: '',
      type: '',
      title: '',
      content: '',
      items: [],
      visible: true,
      collapsed: false,
    },
  ],
  theme: {
    primaryColor: '',
    background: '',
    textColor: '',
  },
  template: '',
  meta: {
    version: 1,
    source: 'mock-analysis',
    updatedAt: '',
  },
};
```

相关文件：

- `src/types/createDraft.js`
- `src/types/analysisResult.js`
- `src/types/siteDraft.js`
- `src/lib/draftGenerator.js`
- `src/state/CreateDraftContext.jsx`

## 9. 编辑器页面结构

`/editor` 是网站草稿编辑体验，不生成真实网站、不发布、不接 AI。

- 顶部：`返回分析`、`重新生成`、`发布网站`。
- 页面标题：`再调整一下，让它更像你`。
- 左侧模块区：固定模块包括头像、个人介绍、经历、项目、技能、作品、联系方式。
- 中间实时预览：展示头像占位、姓名、目标岗位、一句介绍、经历、技能、作品等草稿内容。
- 右侧编辑区：编辑标题、文字、颜色、背景和模块显示状态。
- 小U：左下角悬浮，提示 `已经很不错了，再调整一下吧`。

## 10. 自动保存策略

- 编辑器保存对象：`siteDraft`。
- 保存位置：`localStorage`。
- 保存键名：`pageu.siteDraft`。
- 触发方式：编辑器状态变化后延迟保存。
- 页面提示：先显示 `正在保存`，保存完成后显示 `已保存`。
- 重新进入 `/editor` 时优先读取 `pageu.siteDraft`，没有本地草稿时再从 `createDraft` + `analysisResult` 生成。

## 11. 当前未完成内容

- 未接入真实 AI 接口。
- 未实现真实网站生成。
- 未实现真实发布与分享。
- 未实现登录、数据库或后端。
- 未实现最终 `/site/:id` 的真实个人网站渲染。
- 模块排序当前为按钮模拟，未接入真实拖拽。
- 照片当前仍为文件名/占位展示，未做真实上传和图片预览。

## 12. 下一阶段建议

- Phase 5 可进入发布页 `/publish`，读取 `pageu.siteDraft` 展示发布前确认。
- 定义 `/site/:id` 如何读取 `siteDraft` 并渲染最终个人网站。
- 若需要更接近真实产品，可把编辑器模块拆分为独立组件，降低 `App.jsx` 体积。
- 发布阶段仍建议保持 Mock，不引入后端和真实部署，优先保证比赛演示稳定。

## 13. 已执行的 Git commit 信息

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
