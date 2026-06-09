export const PUBLISH_STORAGE_KEY = 'pageu.publish';

export const createPublishDraft = (overrides = {}) => ({
  published: true,
  siteId: 'demo',
  visibility: 'public',
  publishedAt: new Date().toISOString(),
  ...overrides,
});

export const normalizePublishDraft = (publishDraft) => {
  if (!publishDraft || typeof publishDraft !== 'object') {
    return createPublishDraft();
  }

  return createPublishDraft({
    published: publishDraft.published ?? true,
    siteId: publishDraft.siteId || 'demo',
    visibility: publishDraft.visibility || 'public',
    publishedAt: publishDraft.publishedAt || new Date().toISOString(),
  });
};
