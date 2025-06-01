// api/preview.js
const ogs = require('open-graph-scraper');

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const { result } = await ogs({ url });
    if (result.success) {
      res.json({
        title: result.ogTitle || '',
        description: result.ogDescription || '',
        image:
          (result.ogImage?.url ||
           (Array.isArray(result.ogImage) && result.ogImage[0]?.url)) || '',
        url: result.requestUrl,
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch OG data' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error scraping URL', details: err.message });
  }
}
