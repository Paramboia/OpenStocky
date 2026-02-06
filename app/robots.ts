import type { MetadataRoute } from "next"

const BASE_URL = "https://www.openstocky.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all search engine crawlers
      {
        userAgent: "*",
        allow: "/",
      },
      // Explicitly allow AI/LLM crawlers — we want them to index our content
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "Claudebot", allow: "/" },
      { userAgent: "Anthropic-AI", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Cohere-AI", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "meta-llama", allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
