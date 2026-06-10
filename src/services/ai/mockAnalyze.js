import { createAnalysisResult } from '../../types/analysisResult';

export const createMockAnalysisResult = (createDraft, userAdjustment = '', overrides = {}) => ({
  ...createAnalysisResult(createDraft, userAdjustment),
  meta: {
    provider: 'mock',
    fallback: true,
    error: null,
    updatedAt: new Date().toISOString(),
    ...overrides.meta,
  },
});
