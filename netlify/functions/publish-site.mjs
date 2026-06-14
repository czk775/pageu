import { getStore } from '@netlify/blobs';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

const createJsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: jsonHeaders,
  body: JSON.stringify(payload),
});

const createSiteId = () => {
  const randomPart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `pageu-${Date.now().toString(36)}-${randomPart}`;
};

const getRequestOrigin = (event, bodyOrigin) => {
  if (typeof bodyOrigin === 'string' && /^https?:\/\//.test(bodyOrigin)) {
    return bodyOrigin.replace(/\/$/, '');
  }

  const host = event.headers?.host || event.headers?.Host;
  const protocol = event.headers?.['x-forwarded-proto'] || 'https';

  return host ? `${protocol}://${host}` : '';
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return createJsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return createJsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.siteDraft || typeof body.siteDraft !== 'object') {
      return createJsonResponse(400, { error: 'Missing siteDraft' });
    }

    const siteId = createSiteId();
    const publishedAt = new Date().toISOString();
    const origin = getRequestOrigin(event, body.origin);
    const siteUrl = `${origin}/site/${siteId}`;
    const siteDraft = {
      ...body.siteDraft,
      meta: {
        ...body.siteDraft.meta,
        siteId,
        publishedAt,
        published: true,
      },
    };

    const store = getStore({ name: 'pageu-sites', consistency: 'strong' });
    await store.setJSON(siteId, siteDraft);

    return createJsonResponse(200, {
      siteId,
      siteUrl,
      publishedAt,
    });
  } catch (error) {
    return createJsonResponse(500, {
      error: 'Failed to publish site',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
