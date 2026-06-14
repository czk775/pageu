import { getStore } from '@netlify/blobs';

const createJsonResponse = (payload, init = {}) =>
  Response.json(payload, {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });

const isValidSiteId = (siteId) => /^[a-zA-Z0-9_-]{4,80}$/.test(siteId || '');

export default async function getSite(request) {
  if (request.method !== 'GET') {
    return createJsonResponse({ error: 'Method not allowed' }, { status: 405 });
  }

  const siteId = new URL(request.url).searchParams.get('id') || '';

  if (!isValidSiteId(siteId)) {
    return createJsonResponse({ error: 'Invalid site id' }, { status: 400 });
  }

  try {
    const store = getStore({ name: 'pageu-sites', consistency: 'strong' });
    const siteDraft = await store.get(siteId, { type: 'json' });

    if (!siteDraft) {
      return createJsonResponse({ error: 'Site not found' }, { status: 404 });
    }

    return createJsonResponse({
      siteId,
      siteDraft,
    });
  } catch (error) {
    return createJsonResponse(
      {
        error: 'Failed to load site',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
