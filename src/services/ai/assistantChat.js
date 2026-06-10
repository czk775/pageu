const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen-plus';

const localAnswers = [
  {
    keywords: ['怎么填写经历', '经历怎么填', '填写经历', '经历'],
    answer: '建议描述背景、目标、行动、结果，我会帮你整理成适合个人网站展示的内容。',
  },
  {
    keywords: ['JD是什么', 'jd是什么', '岗位描述', 'JD'],
    answer: 'JD 是岗位描述，把目标岗位要求粘贴进来，我会根据岗位重点帮你组织展示内容。',
  },
  {
    keywords: ['模板怎么选', '选择模板', '模板'],
    answer: '模板只影响视觉风格，不影响你的经历内容。可以先选一个喜欢的，后面还可以调整。',
  },
  {
    keywords: ['为什么要生成个人网站', '个人网站有什么用', '生成个人网站'],
    answer: '个人网站比 PDF 更直观，可以把经历、项目、技能和作品集中展示，并生成链接和二维码分享。',
  },
  {
    keywords: ['能不能重新修改', '重新修改', '还能修改', '修改'],
    answer: '可以，生成后可以在编辑页继续调整内容、颜色、模块和模板。',
  },
];

const fallbackAnswer = '我可以帮你理解填写、分析、编辑和发布流程，你可以问我“怎么填写经历”“模板怎么选”等问题。';

const pageNames = {
  '/': '首页',
  '/create': '创建页',
  '/analyze': 'AI 分析页',
  '/editor': '编辑页',
  '/publish': '发布页',
};

const shouldForceMock = () => Boolean(import.meta.env?.VITEST || import.meta.env?.MODE === 'test');

const buildAssistantSystemPrompt = () =>
  [
    '你是 PageU 产品里的小U，一个面向大学生求职个人网站生成流程的轻量 AI 助手。',
    '你只能回答 PageU 的填写、分析、编辑、发布、模板、个人网站展示相关问题。',
    '回答要短、友好、具体，控制在 120 个中文字符以内。',
    '不要编造用户没有提供的具体经历、学校、公司或证书。',
    '不要输出 Markdown、列表编号、代码块或多段长文。',
    '如果问题和 PageU 无关，引导用户询问“怎么填写经历”“模板怎么选”“JD是什么”等问题。',
  ].join('\n');

const buildAssistantUserPrompt = ({ question, pathname, createDraft }) =>
  JSON.stringify(
    {
      currentPage: pageNames[pathname] || pathname || '未知页面',
      question,
      createDraft: {
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
        skillsInfo: {
          keywords: createDraft?.skillsInfo?.keywords || '',
          certificates: createDraft?.skillsInfo?.certificates || '',
        },
        experiences: (createDraft?.experiences || []).map((experience, index) => ({
          index: index + 1,
          title: experience.title || '',
          description: experience.description || '',
        })),
        template: createDraft?.template || '',
      },
    },
    null,
    2,
  );

const getLocalAnswer = (question = '') => {
  const normalizedQuestion = question.trim().toLowerCase();
  const matched = localAnswers.find((item) =>
    item.keywords.some((keyword) => normalizedQuestion.includes(keyword.toLowerCase())),
  );

  return matched?.answer || fallbackAnswer;
};

const createAssistantResult = (answer, metaOverrides = {}) => ({
  answer,
  meta: {
    provider: 'mock',
    fallback: true,
    error: null,
    updatedAt: new Date().toISOString(),
    ...metaOverrides,
  },
});

const normalizeAssistantAnswer = (content) =>
  String(content || '')
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .trim()
    .slice(0, 220);

export async function answerAssistantQuestion({ question = '', pathname = '/', createDraft = null } = {}) {
  const localResult = createAssistantResult(getLocalAnswer(question));
  const apiKey = import.meta.env?.VITE_DASHSCOPE_API_KEY;
  const provider = import.meta.env?.VITE_AI_PROVIDER || 'qwen';

  if (shouldForceMock() || !apiKey || provider !== 'qwen') {
    return localResult;
  }

  const baseUrl = import.meta.env?.VITE_QWEN_BASE_URL || DEFAULT_BASE_URL;
  const model = import.meta.env?.VITE_QWEN_MODEL || DEFAULT_MODEL;
  const updatedAt = new Date().toISOString();

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: buildAssistantSystemPrompt(),
          },
          {
            role: 'user',
            content: buildAssistantUserPrompt({ question, pathname, createDraft }),
          },
        ],
        temperature: 0.45,
      }),
    });

    if (!response.ok) {
      throw new Error(`DashScope assistant request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = normalizeAssistantAnswer(data?.choices?.[0]?.message?.content);

    if (!content) {
      throw new Error('DashScope assistant response missing content');
    }

    return createAssistantResult(content, {
      provider: 'qwen',
      fallback: false,
      error: null,
      updatedAt,
    });
  } catch (error) {
    return createAssistantResult(getLocalAnswer(question), {
      provider: 'mock',
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown assistant AI error',
      updatedAt: new Date().toISOString(),
    });
  }
}
