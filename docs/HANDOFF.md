# PageU 项目交接文档

## 1. 当前阶段名称

Phase 3 — AI 分析页（Analyze Page / Mock AI）。

## 2. 本阶段完成内容

- 初始化 PageU 前端项目骨架。
- 完成首页核心内容：`PageU`、`生成你的个人网站`、`立即创建`。
- 完成柔和未来感动态背景。
- 完成左下角悬浮的小U 光团助手，包含轻微漂浮动画与极短提示。
- 建立基础路由：`/`、`/create`、`/analyze`、`/editor`、`/publish`、`/site/:id`。
- 首页按钮点击后跳转到 `/create`。
- 完成各占位页的页面名称与一句提示。
- 增加基础自动化测试，覆盖首页核心内容、CTA 跳转和占位路由。
- 完成 `/create` 单页滚动创建页。
- 完成基础信息、求职信息、经历卡片、模板选择和底部生成按钮。
- 建立 `createDraft` 前端状态，并通过 Context 统一维护。
- 创建 `src/types/` 数据结构定义和 `src/data/templates.js` 模板数据。
- 点击 `生成我的个人网站` 后跳转到 `/analyze`，暂不接入真实 AI。
- 完成 `/analyze` Mock AI 分析页。
- 基于 `createDraft` 派生岗位关键词、能力重点、推荐展示顺序、推荐强调经历。
- 完成分析页调整区：`哪里需要调整`、补充输入、`重新分析` 和轻提示。
- 点击 `确认生成` 后跳转 `/editor`，暂不实现真实编辑器。

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
│   ├── test/
│   │   └── setup.js
│   ├── data/
│   │   └── templates.js
│   ├── state/
│   │   └── CreateDraftContext.jsx
│   ├── types/
│   │   ├── createDraft.js
│   │   └── analysisResult.js
│   ├── App.jsx
│   ├── App.test.jsx
│   ├── main.jsx
│   └── styles.css
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## 5. 修改/新增文件列表

- 新增 `.gitignore`
- 新增 `package.json`
- 新增 `index.html`
- 新增 `vite.config.js`
- 新增 `src/main.jsx`
- 新增 `src/App.jsx`
- 新增 `src/styles.css`
- 新增 `src/App.test.jsx`
- 新增 `src/test/setup.js`
- 新增 `src/types/createDraft.js`
- 新增 `src/types/analysisResult.js`
- 新增 `src/data/templates.js`
- 新增 `src/state/CreateDraftContext.jsx`
- 新增 `docs/HANDOFF.md`

## 5.1 Phase 3 新增/修改文件

- 新增 `src/types/analysisResult.js`
- 修改 `src/App.jsx`
- 修改 `src/App.test.jsx`
- 修改 `src/styles.css`
- 修改 `docs/HANDOFF.md`

## 6. 如何本地运行

```bash
npm install
npm run dev
```

默认访问 Vite 输出的本地地址，通常是 `http://localhost:5173/`。

## 7. 如何验收本阶段

1. 执行 `npm install` 安装依赖。
2. 执行 `npm run dev` 启动项目。
3. 打开首页，确认显示 `PageU`、`生成你的个人网站`、`立即创建`。
4. 确认首页有动态科技感背景。
5. 确认左下角显示小U 光团助手，并有轻微漂浮动画。
6. 点击 `立即创建`，确认跳转到 `/create`。
7. 分别访问 `/analyze`、`/editor`、`/publish`、`/site/demo`，确认占位页正常显示。
8. 访问 `/create`，确认四个信息区块完整显示。
9. 在创建页新增经历，确认出现 `经历2`、可折叠、可编辑、可删除。
10. 选择任一模板，确认单选状态切换。
11. 填写岗位 JD 后点击 `生成我的个人网站`，确认跳转到 `/analyze`。
12. 在 `/analyze` 确认标题为 `这是我对你的理解`。
13. 确认显示 4 张分析卡片：岗位关键词、能力重点、推荐展示顺序、推荐强调经历。
14. 点击 `哪里需要调整`，确认出现补充输入框和 `重新分析` 按钮。
15. 输入补充说明并点击 `重新分析`，确认出现 `已根据你的补充重新整理理解`。
16. 点击 `返回修改`，确认回到 `/create`。
17. 点击 `确认生成`，确认跳转 `/editor`。
18. 可执行 `npm run build` 验证生产构建。
19. 可执行 `npm test` 验证基础路由、创建页交互和分析页交互。

## 7.1 本阶段新增状态结构

统一状态名为 `createDraft`，由 `CreateDraftProvider` 提供，当前保存在 React Context 中，并同步到 `localStorage`，便于页面切换后保持输入内容。

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
  experiences: [
    {
      id: 'experience-1',
      title: '',
      description: '',
      collapsed: false,
    },
  ],
  template: 'neo',
  meta: {
    version: 1,
    updatedAt: null,
  },
};
```

相关文件：

- `src/types/createDraft.js`
- `src/state/CreateDraftContext.jsx`

## 7.2 新增页面结构

`/create` 为单页滚动创建流，保留左下角小U 光团助手。

- Block1：认识一下你，包含照片、姓名、联系方式、学校、专业。
- Block2：你想成为谁，包含岗位 JD、目标公司、求职类型，以及假按钮 `让我理解一下这个岗位`。
- Block3：告诉我你的经历，采用经历卡片模式，支持新增、编辑、删除、折叠。
- Block4：选择你喜欢的主页风格，使用 `src/data/templates.js` 中维护的 6 个静态模板。
- 底部：`生成我的个人网站`，点击后跳转 `/analyze`。

## 7.3 下一阶段依赖

- `/analyze` 可直接读取 `createDraft.jobInfo.jd`、`createDraft.experiences` 和 `createDraft.template` 做静态分析演示。
- 编辑器阶段可继续复用 `createDraft`，或基于它派生 `siteDraft`。
- 模板阶段应继续从 `src/data/templates.js` 扩展模板元数据。
- 照片当前仅记录文件名，若下一阶段需要真实预览或上传，需要补充文件预览 URL 或上传存储策略。

## 7.4 Phase 3 分析页页面结构

`/analyze` 是卡片式 Mock AI 产品页，保留全局动态背景和左下角小U 光团助手，小U 提示为 `我先帮你整理了一版。`。

- 页面标题：`这是我对你的理解`。
- 顶部操作：`返回修改`，跳转 `/create`。
- 分析卡片 1：岗位关键词，展示 4-6 个标签。
- 分析卡片 2：能力重点，展示 4-6 个标签。
- 分析卡片 3：推荐展示顺序，展示 4 个排序项。
- 分析卡片 4：推荐强调经历，展示 2-3 条经历。
- 底部主按钮：`确认生成`，跳转 `/editor`。
- 底部次按钮：`哪里需要调整`，展开补充输入区。
- 调整区：包含补充文本框、`重新分析` 按钮和模拟完成提示。

## 7.5 analysisResult 数据说明

`analysisResult` 当前由 `src/types/analysisResult.js` 中的 `createAnalysisResult(createDraft, userAdjustment)` 从 `createDraft` 派生，不调用真实 AI 接口。直接访问 `/analyze` 且没有输入数据时，会显示默认 Mock 内容。

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

派生规则：

- `jobKeywords`：优先根据岗位 JD 命中关键词，否则使用默认示例。
- `abilityFocus`：优先根据岗位 JD 命中能力词，否则使用默认示例。
- `displayOrder`：优先使用用户填写的经历标题，再补默认展示顺序。
- `highlightedExperiences`：优先使用用户填写的经历标题，没有则使用默认示例。
- `userAdjustment`：记录用户在调整区输入的补充说明。
- `updatedAt`：生成 Mock 分析结果的时间。

## 8. 当前未完成内容

- 未接入 AI 接口。
- 未实现真实 AI 分析。
- 未实现真实网站生成。
- 未实现登录、数据库或后端。
- 未实现编辑器真实编辑能力。
- 未实现发布与分享能力。
- 未实现最终个人网站真实数据渲染。

## 9. 下一阶段建议

- 规划编辑器模块的组件边界与数据流。
- 准备个人网站模板的首版视觉方案。
- 定义从 `createDraft` 到分析结果、编辑器草稿的转换方式。
- Phase 4 可实现 `/editor` 的静态编辑器壳，并读取 `analysisResult` / `createDraft` 作为初始内容。

## 10. 已执行的 Git commit 信息

本阶段已按以下 commit message 提交：

```text
feat: initialize PageU landing and app shell
```

Phase 2 commit message：

```text
feat: implement create flow and draft state
```

Phase 3 commit message：

```text
feat: implement mock analyze page
```
