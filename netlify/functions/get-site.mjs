import { getStore } from '@netlify/blobs';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

const createJsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: jsonHeaders,
  body: JSON.stringify(payload),
});

const isValidSiteId = (siteId) => /^[a-zA-Z0-9_-]{4,80}$/.test(siteId || '');

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return createJsonResponse(405, { error: 'Method not allowed' });
  }

  const siteId = event.queryStringParameters?.id || '';

  if (!isValidSiteId(siteId)) {
    return createJsonResponse(400, { error: 'Invalid site id' });
  }

  try {
    const store = getStore({ name: 'pageu-sites', consistency: 'strong' });
    const siteDraft = await store.get(siteId, { type: 'json' });

    if (!siteDraft) {
      return createJsonResponse(404, { error: 'Site not found' });
    }

    return createJsonResponse(200, {
      siteId,
      siteDraft,
    });
  } catch (error) {
    return createJsonResponse(500, {
      error: 'Failed to load site',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
