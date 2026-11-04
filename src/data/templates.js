export const templates = [
  {
    id: 'resume',
    name: 'Resume',
    tone: '极简简历',
    description: '高端极简简历式个人网站',
    designPrompt:
      'A restrained, premium, minimal resume-style personal website on ivory or warm white, charcoal text, hairline borders, one sharp accent, refined serif headlines with clean sans body, strong hierarchy, single-column case-study projects, calm spacing, and a clear contact CTA. Feels like a premium essay, not a product page.',
    palette: ['#0f172a', '#faf8f4', '#1c1917', '#e7e5e4'],
    layoutIntent: '姓名大标题 + 定位 + 联系行，项目像 case study 单列，简历摘要清晰，联系方式克制。',
    personality: '极简、高端、衬线、留白、克制，适合产品、咨询、商业、研究、管理岗求职者。',
  },
  {
    id: 'developer',
    name: 'Developer',
    tone: '清爽开发者',
    description: '干净清爽的开发者个人主页',
    designPrompt:
      'A clean, friendly developer homepage with a light off-white or pale blue base, soft blue section washes, charcoal text, one decisive blue accent, compact nav, centered identity hero with avatar card, clear section rhythm, project grid with hover overlays, and a soft wave transition. Feels like a real personal website, not a landing page.',
    palette: ['#2563eb', '#f2f7ff', '#1e293b', '#dbeafe'],
    layoutIntent: '紧凑导航 + 居中身份 Hero + 头像卡 + 项目网格，节奏清晰、留白充足。',
    personality: '清爽、开发者、亲和、浅蓝、留白，适合技术、产品、AI 方向求职者。',
  },
  {
    id: 'case',
    name: 'Case',
    tone: '案例作品集',
    description: '结构化案例式作品集网站',
    designPrompt:
      'A structured, evidence-based case study portfolio with a neutral base, role-specific accent, clean hierarchy, easy scanning, case-study project cards with problem/role/features/stack/result, skills mapped to real work, and a progress timeline. Rational, organized, product-oriented. Scroll reveal, hover details, no decorative filler.',
    palette: ['#4f46e5', '#f8fafc', '#0f172a', '#e2e8f0'],
    layoutIntent: 'Hero + 简历摘要，项目矩阵卡片，技能与成果强关联，证据导向。',
    personality: '案例、结构化、理性、证据、产品感，适合产品、数据、技术、项目管理、咨询求职者。',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    tone: '电影感',
    description: '深色电影感个人品牌网站',
    designPrompt:
      'A cinematic, dark, minimal personal brand site on a near-black base, warm off-white primary text, one restrained accent, oversized display typography with mono labels, scroll-driven storytelling sections, glass panels with subtle borders, and calm layered motion. Expensive, editorial, restrained.',
    palette: ['#ff6a3d', '#0b0b0f', '#f8f4ec', '#26262e'],
    layoutIntent: '电影感 Hero + 大标题 + 玻璃面板项目区 + 联系 CTA，滚动叙事。',
    personality: '电影感、深色、个人品牌、克制、编辑感，适合 AI、科技、设计、创意求职者。',
  },
];
