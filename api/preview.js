const express = require('express');
const ogs = require('open-graph-scraper');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/preview', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const { result } = await ogs({ url });

    if (result.success) {
      let imageUrl = '';

      // Check multiple places for image
      if (result.ogImage?.url) {
        imageUrl = result.ogImage.url;
      } else if (typeof result.ogImage === 'string') {
        imageUrl = result.ogImage;
      } else if (Array.isArray(result.ogImage) && result.ogImage.length > 0) {
        imageUrl = result.ogImage[0].url || '';
      }

      // Convert relative image path to absolute
      if (imageUrl && imageUrl.startsWith('/')) {
        try {
          const baseUrl = new URL(result.requestUrl);
          imageUrl = baseUrl.origin + imageUrl;
        } catch (e) {
          console.warn('Could not resolve relative image URL:', e.message);
        }
      }

      res.json({
        title: result.ogTitle || '',
        description: result.ogDescription || '',
        image: imageUrl,
        url: result.requestUrl,
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch OG data' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error scraping URL', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OpenGraph preview server running at http://localhost:${PORT}`);
});
