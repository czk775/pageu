import { createMockAnalysisResult } from './mockAnalyze';
import { buildSystemPrompt, buildUserPrompt } from './prompts';

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen-plus';

const clampArray = (items, fallback) => {
  const source = Array.isArray(items) ? items : [];
  return [...new Set([...source, ...fallback].map((item) => String(item || '').trim()).filter(Boolean))].slice(0, 6);
};

const removeGenericDisplayOrder = (items, fallbackItems) => {
  const hasRealExperienceTitle = fallbackItems.some((item) => !['项目经历', '比赛经历', '校园经历', '技能证书', '教育背景', '联系方式'].includes(item));

  if (!hasRealExperienceTitle) {
    return items;
  }

  return items.filter((item) => item !== '项目经历');
};

const stripCodeFence = (content) =>
  content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

const extractJsonObject = (content) => {
  const stripped = stripCodeFence(content);
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return stripped.slice(firstBrace, lastBrace + 1);
  }

  return stripped;
};

const parseAnalysisContent = (content) => {
  try {
    return JSON.parse(content);
  } catch {
    return JSON.parse(extractJsonObject(content));
  }
};

export const normalizeAnalysisPayload = (payload, fallbackResult, meta) => ({
  jobKeywords: clampArray(payload?.jobKeywords, fallbackResult.jobKeywords),
  abilityFocus: clampArray(payload?.abilityFocus, fallbackResult.abilityFocus),
  displayOrder: removeGenericDisplayOrder(clampArray(payload?.displayOrder, fallbackResult.displayOrder), fallbackResult.displayOrder).slice(0, 6),
  highlightedExperiences: clampArray(payload?.highlightedExperiences, fallbackResult.highlightedExperiences),
  userAdjustment: fallbackResult.userAdjustment,
  updatedAt: meta.updatedAt,
  meta,
});

const shouldForceMock = () => Boolean(import.meta.env?.VITEST || import.meta.env?.MODE === 'test');

export async function analyzeCareerDraft(createDraft, userAdjustment = '') {
  const fallbackResult = createMockAnalysisResult(createDraft, userAdjustment);
  const apiKey = import.meta.env?.VITE_DASHSCOPE_API_KEY;
  const provider = import.meta.env?.VITE_AI_PROVIDER || 'qwen';

  if (shouldForceMock() || !apiKey || provider !== 'qwen') {
    return fallbackResult;
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
            content: buildSystemPrompt(),
          },
          {
            role: 'user',
            content: buildUserPrompt(createDraft, userAdjustment),
          },
        ],
        temperature: 0.3,
        response_format: {
          type: 'json_object',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`DashScope request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('DashScope response missing content');
    }

    const parsed = parseAnalysisContent(content);

    return normalizeAnalysisPayload(parsed, fallbackResult, {
      provider: 'qwen',
      fallback: false,
      error: null,
      updatedAt,
    });
  } catch (error) {
    return createMockAnalysisResult(createDraft, userAdjustment, {
      meta: {
        provider: 'mock',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown AI error',
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
