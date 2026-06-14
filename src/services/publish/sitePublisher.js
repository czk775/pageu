export const PUBLISH_SITE_FUNCTION = '/.netlify/functions/publish-site';
export const GET_SITE_FUNCTION = '/.netlify/functions/get-site';

const normalizeOrigin = (origin) => {
  if (origin) {
    return origin.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
};

export async function publishSiteDraft(siteDraft, options = {}) {
  const fetcher = options.fetcher || fetch;
  const origin = normalizeOrigin(options.origin);

  const response = await fetcher(PUBLISH_SITE_FUNCTION, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteDraft, origin }),
  });

  if (!response.ok) {
    throw new Error('发布失败，请稍后重试');
  }

  const payload = await response.json();

  if (!payload?.siteId || !payload?.siteUrl) {
    throw new Error('发布结果缺少访问链接');
  }

  return {
    siteId: payload.siteId,
    siteUrl: payload.siteUrl,
    publishedAt: payload.publishedAt || new Date().toISOString(),
  };
}

export async function loadPublishedSiteDraft(siteId, options = {}) {
  const fetcher = options.fetcher || fetch;
  const encodedSiteId = encodeURIComponent(siteId);
  const response = await fetcher(`${GET_SITE_FUNCTION}?id=${encodedSiteId}`);

  if (!response.ok) {
    throw new Error('未找到已发布的网站');
  }

  const payload = await response.json();

  if (!payload?.siteDraft) {
    throw new Error('已发布的网站数据为空');
  }

  return payload.siteDraft;
}
