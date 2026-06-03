import { initSession, screenshot } from '../lib/ssweb2.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ Error: 'Method not allowed' });

  try {
    await initSession();
    const result = await screenshot(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      Status: false,
      Code: 500,
      Input: req.body?.input ?? null,
      Device: req.body?.device ?? null,
      Download_url: null,
      Error: err.message
    });
  }
}
