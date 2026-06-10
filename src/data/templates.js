export const templates = [
  {
    id: 'neo',
    name: 'Neo',
    tone: '灵动渐变',
    description: '科技感个人网站',
    designPrompt:
      'A futuristic personal portfolio website with a strong hero section, soft cyan-blue-purple gradients, floating glass cards, subtle motion, large confident typography, glowing skill tags, and interactive project cards. The layout should feel like a modern AI startup landing page mixed with a personal portfolio. Avoid cyberpunk darkness; keep it bright, premium, and youthful.',
    palette: ['#22b9e9', '#7c5cff', '#6be7c8', '#f2fbff'],
    layoutIntent: 'Hero 强视觉首屏，Highlights 浮动卡片，Projects 大卡片展示，Skills 发光标签，Contact CTA 清晰。',
    personality: '科技、未来、动态、渐变、发光、浮动卡片，适合 AI、技术、互联网、产品经理。',
  },
  {
    id: 'pure',
    name: 'Pure',
    tone: '清爽留白',
    description: '极简高级个人网站',
    designPrompt:
      'A minimalist personal website with generous whitespace, black-white-gray palette, editorial typography, calm spacing, single-column reading flow, and project case studies presented like premium essays. The design should feel restrained, elegant, and professional. Avoid unnecessary decoration.',
    palette: ['#111111', '#f7f7f2', '#8a8a8a', '#ffffff'],
    layoutIntent: '大标题姓名，简洁 About，项目像 case study，时间线清晰，联系方式克制。',
    personality: '极简、留白、高级、克制、黑白灰、阅读感，适合产品、咨询、商业、研究。',
  },
  {
    id: 'flow',
    name: 'Flow',
    tone: '柔和流线',
    description: '杂志叙事型个人网站',
    designPrompt:
      'A magazine-style storytelling portfolio with split layouts, soft flowing shapes, large section headlines, narrative experience blocks, project stories, and smooth vertical rhythm. Use gentle lavender, pink, blue, and warm off-white. The site should feel expressive, human, and editorial.',
    palette: ['#8d7cf6', '#f4a7c3', '#91c8ff', '#fff8ef'],
    layoutIntent: '分栏 Hero，Experience Story 优先，项目用故事块，works 像文章推荐。',
    personality: '杂志、叙事、分栏、柔和流线、故事感，适合市场、运营、创意表达、消费者研究。',
  },
  {
    id: 'grid',
    name: 'Grid',
    tone: '秩序网格',
    description: '结构化作品集网站',
    designPrompt:
      'A structured portfolio dashboard with modular grid cards, clear information hierarchy, project cards, skill cards, achievement cards, and crisp borders. The design should feel rational, organized, and product-oriented, like a clean SaaS dashboard turned into a personal portfolio.',
    palette: ['#2563eb', '#0f172a', '#e2e8f0', '#f8fafc'],
    layoutIntent: 'Hero + summary grid，Projects 多卡片矩阵，Skills 独立卡，Highlights 数据卡，Contact 简洁。',
    personality: '网格、模块、理性、清晰、产品感、信息密度，适合产品、数据、技术、项目管理。',
  },
  {
    id: 'canvas',
    name: 'Canvas',
    tone: '创意画布',
    description: '创意画布式个人网站',
    designPrompt:
      "A creative portfolio canvas with bold color blocks, asymmetrical layout, large project showcase cards, playful spacing, expressive typography, and visual storytelling. The site should feel like a curated exhibition of a person's work and ideas, not a resume. Keep it polished, not messy.",
    palette: ['#ff7a59', '#ffe46b', '#25c2a0', '#fff7e8'],
    layoutIntent: '大色块 Hero，项目像展览卡，Works 优先展示，适合滚动浏览，视觉冲击更强。',
    personality: '创意、画布、作品展、撞色、不对称、表达，适合设计、营销、创意方案、活动策划。',
  },
  {
    id: 'glass',
    name: 'Glass',
    tone: '轻透玻璃',
    description: '轻科技玻璃拟态个人网站',
    designPrompt:
      'A soft glassmorphism personal website with translucent cards, blurred gradient background, cyan-green-blue palette, floating modules, rounded corners, and smooth hierarchy. The feeling should be gentle, premium, futuristic, and approachable. Avoid heavy shadows and dark hacker aesthetics.',
    palette: ['#20c7d8', '#61e6b5', '#b8f4ff', '#f5feff'],
    layoutIntent: '玻璃 Hero 卡，Projects 玻璃卡片，Skills 胶囊标签，Works 链接卡，Contact 温和 CTA。',
    personality: '玻璃拟态、轻科技、透明、柔和、青绿、漂浮，适合泛用求职展示、AI产品、学生作品集。',
  },
];
