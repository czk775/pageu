const fallbackKeywords = ['产品设计', '需求分析', 'AI 理解', '沟通协作', '项目落地'];
const fallbackAbilities = ['产品思维', '技术理解', '表达能力', '执行力', '用户洞察'];
const fallbackDisplayOrder = ['项目经历', '比赛经历', '校园经历', '技能证书'];
const fallbackDisplayOrderAfterRealTitles = ['技能证书', '教育背景', '联系方式'];
const fallbackExperiences = ['校园项目经历', '比赛协作经历', '社团实践经历'];

const keywordRules = [
  ['产品', '产品设计'],
  ['需求', '需求分析'],
  ['AI', 'AI 理解'],
  ['沟通', '沟通协作'],
  ['协作', '沟通协作'],
  ['项目', '项目落地'],
  ['用户', '用户洞察'],
  ['数据', '数据分析'],
  ['前端', '前端实现'],
  ['React', 'React 开发'],
];

const abilityRules = [
  ['产品', '产品思维'],
  ['技术', '技术理解'],
  ['前端', '技术理解'],
  ['表达', '表达能力'],
  ['沟通', '表达能力'],
  ['执行', '执行力'],
  ['用户', '用户洞察'],
  ['分析', '分析判断'],
];

const unique = (items) => [...new Set(items.filter(Boolean))];

const pickByRules = (source, rules, fallback) => {
  const matched = rules
    .filter(([signal]) => source.toLowerCase().includes(signal.toLowerCase()))
    .map(([, result]) => result);

  return unique([...matched, ...fallback]).slice(0, 6);
};

export const createAnalysisResult = (createDraft, userAdjustment = '') => {
  const jd = createDraft?.jobInfo?.jd || '';
  const experienceTitles = (createDraft?.experiences || [])
    .map((experience) => experience.title?.trim())
    .filter(Boolean);

  const displayOrder = unique([
    ...experienceTitles,
    ...(experienceTitles.length > 0 ? fallbackDisplayOrderAfterRealTitles : fallbackDisplayOrder),
  ]).slice(0, 4);
  const highlightedExperiences = (experienceTitles.length > 0 ? experienceTitles : fallbackExperiences).slice(0, 3);

  return {
    jobKeywords: pickByRules(jd, keywordRules, fallbackKeywords).slice(0, 6),
    abilityFocus: pickByRules(jd, abilityRules, fallbackAbilities).slice(0, 6),
    displayOrder,
    highlightedExperiences,
    userAdjustment,
    updatedAt: new Date().toISOString(),
  };
};
