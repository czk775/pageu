import { getStore } from '@netlify/blobs';

const createJsonResponse = (payload, init = {}) =>
  Response.json(payload, {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });

const createSiteId = () => {
  const randomPart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `pageu-${Date.now().toString(36)}-${randomPart}`;
};

const getRequestOrigin = (request, bodyOrigin) => {
  if (typeof bodyOrigin === 'string' && /^https?:\/\//.test(bodyOrigin)) {
    return bodyOrigin.replace(/\/$/, '');
  }

  return new URL(request.url).origin;
};

export default async function publishSite(request) {
  if (request.method === 'OPTIONS') {
    return createJsonResponse({ ok: true });
  }

  if (request.method !== 'POST') {
    return createJsonResponse({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();

    if (!body.siteDraft || typeof body.siteDraft !== 'object') {
      return createJsonResponse({ error: 'Missing siteDraft' }, { status: 400 });
    }

    const siteId = createSiteId();
    const publishedAt = new Date().toISOString();
    const origin = getRequestOrigin(request, body.origin);
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

    return createJsonResponse({
      siteId,
      siteUrl,
      publishedAt,
    });
  } catch (error) {
    return createJsonResponse(
      {
        error: 'Failed to publish site',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
