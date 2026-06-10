const formatExperience = (experience, index) => ({
  index: index + 1,
  title: experience.title || '',
  description: experience.description || '',
});

export const buildSystemPrompt = () =>
  [
    '你是 PageU 的求职材料分析助手。',
    '你只输出严格 JSON，不输出 Markdown、解释、代码块或额外文本。',
    '基于用户的基础信息、岗位 JD、经历和补充调整，生成适合个人网站展示的分析结果。',
    '不要编造不存在的具体经历；如果信息不足，生成合理但谨慎的默认项。',
    '每个数组 3-6 项，内容必须简短。',
    '输出格式必须完全符合：{"jobKeywords":["..."],"abilityFocus":["..."],"displayOrder":["..."],"highlightedExperiences":["..."]}',
  ].join('\n');

export const buildUserPrompt = (createDraft, userAdjustment = '') =>
  JSON.stringify(
    {
      basicInfo: {
        name: createDraft?.basicInfo?.name || '',
        school: createDraft?.basicInfo?.school || '',
        major: createDraft?.basicInfo?.major || '',
      },
      jobInfo: {
        jd: createDraft?.jobInfo?.jd || '',
        company: createDraft?.jobInfo?.company || '',
        jobType: createDraft?.jobInfo?.jobType || '',
      },
      experiences: (createDraft?.experiences || []).map(formatExperience),
      selectedTemplate: createDraft?.template || '',
      userAdjustment,
      outputRules: {
        jobKeywords: '岗位关键词，3-6 项',
        abilityFocus: '能力重点，3-6 项',
        displayOrder: '推荐展示顺序，3-6 项',
        highlightedExperiences: '推荐强调经历，3-6 项；优先使用用户真实经历标题',
      },
    },
    null,
    2,
  );
