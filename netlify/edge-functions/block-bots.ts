const NO_ROBOTS = "noindex, nofollow, noarchive, nosnippet, noimageindex";
const BLOCKED_AGENT_CATEGORY_PATTERN =
  /^(?:ai-agent|crawler|page-preview|tooling|none)(?:;|$)/i;

const BOT_USER_AGENT_PATTERN =
  /\b(?:bot|crawler|spider|scraper|fetcher|archiver|monitor|headlesschrome|phantomjs|puppeteer|playwright|selenium|curl|wget|python-requests|aiohttp|httpx|go-http-client|java|okhttp|libwww-perl|mechanize|scrapy|nutch|larbin|gptbot|chatgpt-user|oai-searchbot|ccbot|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|youbot|googlebot|googleother|google-extended|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|mojeekbot|qwantify|seznambot|petalbot|applebot|applebot-extended|bytespider|amazonbot|facebookbot|meta-externalagent|meta-externalfetcher|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|skypeuripreview|pinterestbot|ahrefsbot|ahrefssiteaudit|semrushbot|mj12bot|dotbot|blexbot|dataforseobot|screaming frog seo spider|siteauditbot|megaindex|seekportbot|censysinspect|ltx71|turnitinbot|magpie-crawler|diffbot|omgili|imagesiftbot|cohere-ai)\b/i;

export default async (
  request: Request,
  context: { next: () => Promise<Response> },
) => {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/robots.txt") {
    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set("x-robots-tag", NO_ROBOTS);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const userAgent = request.headers.get("user-agent")?.trim() ?? "";
  const agentCategory =
    request.headers.get("netlify-agent-category")?.trim() ?? "";

  if (
    !userAgent ||
    BLOCKED_AGENT_CATEGORY_PATTERN.test(agentCategory) ||
    BOT_USER_AGENT_PATTERN.test(userAgent)
  ) {
    return new Response("Forbidden", {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": NO_ROBOTS,
      },
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", NO_ROBOTS);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
