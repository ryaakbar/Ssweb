/**
 * api.js — SnapShot API Layer
 * Wraps: Pikwy (ssweb.js), Microlink (ssweb1.js), Vivoldi (ssweb2.js)
 * All calls go through the /api/* Express routes on server.js
 */

const SnapAPI = (() => {

  async function capture(provider, config) {
    const res = await fetch(`/api/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.Error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  return { capture };
})();
