# PageU 项目交接文档

## 1. 当前阶段名称

PageU 前端项目骨架与首页 MVP 初始化。

## 2. 本阶段完成内容

- 初始化 PageU 前端项目骨架。
- 完成首页核心内容：`PageU`、`生成你的个人网站`、`立即创建`。
- 完成柔和未来感动态背景。
- 完成左下角悬浮的小U 光团助手，包含轻微漂浮动画与极短提示。
- 建立基础路由：`/`、`/create`、`/analyze`、`/editor`、`/publish`、`/site/:id`。
- 首页按钮点击后跳转到 `/create`。
- 完成各占位页的页面名称与一句提示。
- 增加基础自动化测试，覆盖首页核心内容、CTA 跳转和占位路由。

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
- 新增 `docs/HANDOFF.md`

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
8. 可执行 `npm run build` 验证生产构建。
9. 可执行 `npm test` 验证基础路由与首页内容。

## 8. 当前未完成内容

- 未接入 AI 接口。
- 未实现完整创建流程。
- 未实现登录、数据库或后端。
- 未实现编辑器真实编辑能力。
- 未实现发布与分享能力。
- 未实现最终个人网站真实数据渲染。

## 9. 下一阶段建议

- 设计创建页的信息输入结构。
- 建立简历经历、目标岗位 JD 等前端状态模型。
- 增加 AI 分析结果页的静态演示数据。
- 规划编辑器模块的组件边界与数据流。
- 准备个人网站模板的首版视觉方案。

## 10. 已执行的 Git commit 信息

本阶段已按以下 commit message 提交：

```text
feat: initialize PageU landing and app shell
```
