import { createPublishDraft, normalizePublishDraft, PUBLISH_STORAGE_KEY } from '../types/publishDraft';
import { normalizeSiteDraft, SITE_DRAFT_STORAGE_KEY } from '../types/siteDraft';
import { DRAFT_STORAGE_KEY } from '../types/createDraft';

export const PUBLIC_SITE_PATH = '/site/demo';

export const readJsonStorage = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(key));
  } catch {
    return null;
  }
};

export const writeJsonStorage = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const loadSiteDraft = (fallbackDraft) => normalizeSiteDraft(readJsonStorage(SITE_DRAFT_STORAGE_KEY)) || fallbackDraft;

export const saveSiteDraft = (siteDraft) => writeJsonStorage(SITE_DRAFT_STORAGE_KEY, siteDraft);

export const loadPublishDraft = () => normalizePublishDraft(readJsonStorage(PUBLISH_STORAGE_KEY));

export const savePublishDraft = (publishDraft) =>
  writeJsonStorage(
    PUBLISH_STORAGE_KEY,
    createPublishDraft({
      ...publishDraft,
      published: true,
      siteId: 'demo',
    }),
  );

export const toSvgDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const resetPageUState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  [
    DRAFT_STORAGE_KEY,
    'pageu.createDraft',
    SITE_DRAFT_STORAGE_KEY,
    PUBLISH_STORAGE_KEY,
    'pageu.analysisResult',
  ].forEach((key) => window.localStorage.removeItem(key));
};
