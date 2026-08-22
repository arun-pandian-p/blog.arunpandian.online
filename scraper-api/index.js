const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright-chromium');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/design-scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser;
  try {
    // Launch headless Chromium
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set a realistic viewport and user agent to avoid basic anti-bot blocking
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Navigate to the target URL, wait for network idle to ensure CSS is loaded
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

    // Inject and execute our ported extraction logic in the browser context
    const extractionResult = await page.evaluate(() => {
      // 1. Color Extraction
      const allElements = document.querySelectorAll('*');
      const colorCounts = {};
      const bgColorCounts = {};
      const fonts = new Set();
      
      let totalNodes = 0;
      let totalDepth = 0;

      // Recursive function to calculate DOM complexity (depth)
      function getDepth(node, currentDepth) {
        if (currentDepth > totalDepth) totalDepth = currentDepth;
        totalNodes++;
        for (let i = 0; i < node.children.length; i++) {
          getDepth(node.children[i], currentDepth + 1);
        }
      }
      getDepth(document.body, 1);

      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        // Count text colors
        const color = style.color;
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        }

        // Count background colors
        const bgColor = style.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          bgColorCounts[bgColor] = (bgColorCounts[bgColor] || 0) + 1;
        }

        // Collect fonts
        const fontFamily = style.fontFamily;
        if (fontFamily) {
          const mainFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          fonts.add(mainFont);
        }
      });

      // Sort and get top colors
      const sortedTextColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
      const sortedBgColors = Object.entries(bgColorCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);

      // Metrics: Density & Complexity formulas (simplified from web-design-scraper)
      // Complexity = DOM nodes / max depth ratio (normalized roughly 0-1)
      const complexity = Math.min(1.0, (totalNodes / 1000) * (totalDepth / 20));
      
      // Density = text length / total nodes (normalized)
      const textLength = document.body.innerText.length;
      const density = Math.min(1.0, (textLength / 5000));
      
      // Economy = how few distinct colors and fonts are used
      const economy = Math.max(0.0, 1.0 - ((sortedTextColors.length + sortedBgColors.length + fonts.size) / 50));
      
      // Symmetry = checking alignment of major structural elements (simplified)
      const symmetry = 0.85; // Placeholder for complex bounding-box structural alignment

      // Extract some recognizable UI components
      const components = [];
      const buttons = document.querySelectorAll('button, a.button, .btn');
      if (buttons.length > 0) {
        const firstBtn = buttons[0];
        components.push({
          type: 'button',
          html: firstBtn.outerHTML.substring(0, 100) + '...',
          css: `background: ${window.getComputedStyle(firstBtn).backgroundColor}; color: ${window.getComputedStyle(firstBtn).color}; border-radius: ${window.getComputedStyle(firstBtn).borderRadius};`
        });
      }

      return {
        url: window.location.href,
        colors: {
          dominant: sortedBgColors.slice(0, 3),
          accent: sortedTextColors.slice(0, 2),
        },
        fonts: Array.from(fonts).slice(0, 3),
        metrics: {
          symmetry: Number(symmetry.toFixed(2)),
          density: Number(density.toFixed(2)),
          complexity: Number(complexity.toFixed(2)),
          economy: Number(economy.toFixed(2)),
        },
        components: components
      };
    });

    res.json(extractionResult);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape the URL. ' + error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Scraper API running on http://localhost:${PORT}`);
});
