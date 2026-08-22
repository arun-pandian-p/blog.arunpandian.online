# Design Scraper API

This is a local Node.js microservice that uses Playwright to extract design metrics (colors, fonts, layout complexity, density) from target URLs. It replaces the client-side proxy-based scraper to provide a much more reliable, JavaScript-rendered extraction layer (mimicking the formulas from `web-design-scraper`).

## Prerequisites
- Node.js v18+

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the server:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3001`.

## Deployment

Since this service uses a headless Chromium browser (`playwright-chromium`), it cannot run in serverless edge environments like Supabase Edge Functions or Cloudflare Workers without external integrations like Browserless.io.

**Recommended deployment targets:**
- Render (Web Service using the Node environment)
- Heroku
- Railway

Once deployed, update the API URL in `src/pages/admin/studio/ScraperPanel.tsx` to point to your hosted service URL instead of `http://localhost:3001`.
