// 模拟求职者数据：用于 /site/demo 无本地草稿时展示完整个人网站效果。
// 这些数据只用于演示，不参与真实创建流程；真实流程仍由创建页输入驱动。
// 图片路径指向 public/demo/ 下的演示素材。

export const DEMO_IMAGE_BASE = '/demo';

export const demoAvatarUrl = `${DEMO_IMAGE_BASE}/avatar.png`;
export const demoProjectCoverUrl = (name) => `${DEMO_IMAGE_BASE}/${name}.png`;

export const createDemoDraft = () => ({
  basicInfo: {
    photoName: 'avatar.png',
    photoUrl: demoAvatarUrl,
    photoPreviewUrl: demoAvatarUrl,
    name: '林知行',
    phone: '138 0000 8888',
    email: 'linzhixing@example.com',
    school: '北京理工大学',
    major: '数字媒体技术',
    selfIntro:
      '我是林知行，一名关注 AI 产品与用户体验的数字媒体技术专业学生。\n我喜欢观察真实用户的问题，用产品思维和技术能力把想法变成可用的产品。\n相信好的求职展示，应该让面试官看到一个完整的人，而不只是一页简历。',
    personalTagline: 'AI 产品 × 用户体验 · 用产品思维连接技术与用户',
  },
  aboutInfo: {
    background: '数字媒体技术背景，主攻 AI 产品设计与前端实现，理解从用户洞察到产品落地的完整链路。',
    interests: '关注 AI 应用、青年文化消费、播客与内容社区，喜欢用业余时间做小产品实验。',
    strengths: '跨职能沟通、快速原型、数据驱动的产品决策，习惯把复杂问题拆成可执行的小步骤。',
  },
  jobInfo: {
    jd: '岗位名称：AI 产品经理（实习）\n岗位职责：负责 AI 产品的需求分析、产品方案设计与跨团队推进；\n任职要求：具备产品思维与用户洞察能力，熟悉 AI 应用场景，有项目落地经验。',
    company: '字节跳动',
    jobType: 'internship',
    motivation: '希望把技术理解转化为真实产品价值，做连接用户与 AI 能力的人。',
  },
  skillsInfo: {
    keywords: '产品设计、用户研究、需求分析、Figma、React、Python、数据分析、项目管理',
    certificates: '英语六级、校级一等奖学金、全国大学生互联网+创新大赛省金奖',
  },
  experiences: [
    {
      id: 'experience-1',
      title: 'PageU · AI 求职个人网站生成平台',
      role: '产品负责人 / 前端开发',
      period: '2026.03 - 2026.06',
      summary: '用 AI 帮助求职者低门槛生成可分享的个人网站，打通「填写 → AI 分析 → 生成 → 发布」闭环。',
      description:
        '项目背景：传统简历信息容量有限，求职者项目成果难以展示。\n我的目标：设计并落地一款让普通求职者也能生成个人网站的 AI 产品。\n我的行动：完成竞品与用户访谈，梳理核心流程与信息架构；搭建 React 前端与 AI 分析服务；设计 6 套差异化模板。\n产出结果：形成完整可演示的产品闭环，接入通义千问实现岗位理解与经历分析，获得校内创新项目立项。',
      coverName: 'project-pageu.png',
      coverUrl: demoProjectCoverUrl('project-pageu'),
      link: 'https://pageu-ai-career.netlify.app/',
      collapsed: false,
    },
    {
      id: 'experience-2',
      title: '校园通 · 一站式校园服务小程序',
      role: '产品设计 / 交互原型',
      period: '2025.09 - 2026.01',
      summary: '面向新生的校园服务聚合产品，覆盖地图导览、活动发现与二手社区，上线后周活跃超 3000。',
      description:
        '项目背景：新生入学信息分散，校园服务入口割裂。\n我的目标：做一个新生真正愿意用的校园服务入口。\n我的行动：访谈 40+ 新生定位高频场景；输出信息架构与高保真原型；协同开发完成上线与数据埋点。\n产出结果：上线 6 周注册超 5000 人，周活跃 3000+，获校园创新创业大赛二等奖。',
      coverName: 'project-campus.png',
      coverUrl: demoProjectCoverUrl('project-campus'),
      link: '',
      collapsed: false,
    },
    {
      id: 'experience-3',
      title: '校园消费行为数据分析报告',
      role: '数据分析 / 报告撰写',
      period: '2025.03 - 2025.06',
      summary: '基于 12 万条校园消费记录，产出学生消费画像与食堂档口优化建议。',
      description:
        '项目背景：校方希望了解学生消费结构，优化食堂与商业布局。\n我的目标：用数据回答「学生把钱花在哪里、为什么」。\n我的行动：清洗 12 万条脱敏消费记录，完成分层分析与可视化；输出 8 页决策报告。\n产出结果：报告被后勤部门采纳，成为食堂档口调整的依据之一。',
      coverName: 'project-data.png',
      coverUrl: demoProjectCoverUrl('project-data'),
      link: '',
      collapsed: false,
    },
    {
      id: 'experience-4',
      title: 'AI 创意工坊 · 大学生 AI 产品共创社群',
      role: '发起人 / 运营',
      period: '2025.09 - 至今',
      summary: '发起校内 AI 产品共创社群，组织 6 场工作坊，产出 12 个学生 AI 产品原型。',
      description:
        '项目背景：身边同学对 AI 感兴趣但缺少实践与交流场景。\n我的目标：搭建一个低门槛的 AI 产品实践社群。\n我的行动：设计工作坊流程，对接导师与行业资源，组织原型评审会。\n产出结果：社群 200+ 成员，6 场活动累计参与 400 人次，12 个原型落地演示。',
      coverName: '',
      coverUrl: '',
      link: '',
      collapsed: false,
    },
    {
      id: 'experience-5',
      title: '播客「产品夜话」主理人',
      role: '内容创作 / 剪辑',
      period: '2024.10 - 至今',
      summary: '与同学共创的泛产品播客，讨论 AI、消费与青年文化，单期最高 1.2 万播放。',
      description:
        '项目背景：想把课堂上学到的产品方法用到真实内容场景。\n我的目标：做出一个有人愿意听完的产品讨论节目。\n我的行动：负责选题策划、嘉宾对接与剪辑，持续稳定更新 20+ 期。\n产出结果：累计播放 8 万+，沉淀了一批关注 AI 与消费的听众。',
      coverName: '',
      coverUrl: '',
      link: '',
      collapsed: false,
    },
  ],
  stylePreference: '',
  template: 'resume',
  meta: {
    version: 1,
    updatedAt: null,
  },
});

// 提供一份可直接渲染的完整 siteDraft（由 demo 草稿派生），
// 供无 localStorage 场景与测试使用。
export const createDemoSiteDraft = (generator) => generator(createDemoDraft());
