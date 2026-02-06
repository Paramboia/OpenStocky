# SEO Audit — OpenStocky

**Domain:** www.openstocky.com  
**Last updated:** February 2026

---

## Summary

OpenStocky has been configured with SEO best practices and explicit support for AI/LLM crawlers. All content is crawlable and indexable.

---

## Implemented

### 1. Metadata (`app/layout.tsx`)

- **Title:** "OpenStocky — Open Source Stock Portfolio Tracker" with template for subpages
- **Description:** ~160 chars, keyword-rich
- **Keywords:** stock portfolio, investment tracker, IRR, CAGR, Sharpe ratio, open source, etc.
- **Canonical URL:** https://www.openstocky.com
- **metadataBase:** Used for resolving relative URLs in Open Graph and Twitter cards

### 2. Open Graph & Twitter Cards

- Open Graph: type, locale, url, siteName, title, description, images
- Twitter: summary_large_image card, title, description, images
- Enables proper previews when shared on social platforms

### 3. Robots

- **robots.ts:** Generates `/robots.txt`
- **All crawlers allowed:** `User-agent: *` with `Allow: /`
- **AI bots explicitly allowed:**
  - GPTBot (OpenAI)
  - ChatGPT-User
  - Claude-Web, Claudebot, Anthropic-AI
  - Google-Extended
  - PerplexityBot
  - Applebot-Extended
  - Cohere-AI
  - Bytespider (ByteDance)
  - meta-llama (Meta)
- **Sitemap:** Referenced in robots.txt
- **Host:** www.openstocky.com

### 4. Sitemap

- **sitemap.ts:** Generates `/sitemap.xml`
- **URLs:** https://www.openstocky.com (priority 1, weekly)
- Accessible at `https://www.openstocky.com/sitemap.xml`

### 5. JSON-LD Structured Data

- **Type:** WebApplication
- **Schema.org:** @context, @type, name, description, url, applicationCategory, operatingSystem, offers, featureList
- Helps search engines and AI systems understand the app

### 6. Crawlable Content

- **SeoIntro component:** Server-rendered article at bottom of page
- **Content:** About OpenStocky, core features, metrics, dashboard
- **Semantic HTML:** h2, h3, ul, p, article
- **Visible:** Small card-style block for transparency and accessibility

### 7. Technical

- `lang="en"` on `<html>`
- `robots.index: true`, `robots.follow: true`
- `googleBot` rules for max preview
- `alternates.canonical` set to base URL

---

## Hosting Recommendations

### www vs non-www

If you use both openstocky.com and www.openstocky.com, configure a 301 redirect at your host (Vercel, Cloudflare, etc.):

- `openstocky.com` → `https://www.openstocky.com`
- `http://www.openstocky.com` → `https://www.openstocky.com`

### Vercel

- Add `openstocky.com` and `www.openstocky.com` to domains
- Enable HTTPS
- Redirect bare domain to www in Domain settings

### Cloudflare

- Page Rules or Redirect Rules: `*openstocky.com/*` → `https://www.openstocky.com/$1` (301)

---

## Future Improvements

1. **OG/Twitter image:** Replace `/placeholder.svg` with a 1200×630 PNG for better social previews
2. **favicon.ico:** Add to `/public`
3. **apple-touch-icon:** Add to `/public` for iOS
4. **manifest.json:** Web app manifest for PWA discovery
5. **Additional pages:** If you add docs, blog, or about, update sitemap and metadata per page

---

## Verification

- **robots.txt:** https://www.openstocky.com/robots.txt
- **sitemap:** https://www.openstocky.com/sitemap.xml
- **Rich results:** [Google Rich Results Test](https://search.google.com/test/rich-results)
- **Structured data:** [Schema.org Validator](https://validator.schema.org/)
