/**
 * SEO & GEO 语义化 JSON-LD 数据注入
 * 动态添加结构化数据以解决 CSP 限制
 */

// 主应用 Schema
const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Professional React Slot Machine",
  "alternateName": ["Casino Slots", "Free Slot Machine", "React Casino Game"],
  "url": "https://your-domain.com",
  "image": "https://your-domain.com/slot-machine-preview.jpg",
  "description": "Professional-grade React slot machine game with 97.5% RTP (Return to Player). Features 5 reels, 3 rows, multiple winning combinations. Perfect for casino enthusiasts.",
  "applicationCategory": "GameApplication",
  "applicationSubCategory": "Casino Game",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "description": "Free to play - No download required"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "150",
    "reviewCount": "150",
    "bestRating": "5.0",
    "worstRating": "1.0"
  },
  "featureList": "5 Reels, 3 Rows, RTP 97.5%, Instant Win, Mobile Compatible, No Download",
  "screenshot": "https://your-domain.com/screenshot.jpg",
  "downloadUrl": "https://your-domain.com",
  "softwareVersion": "2026.1.0",
  "releaseNotes": "Latest RTP certified 97.5%. Enhanced animations. Mobile optimized.",
  "contentRating": "18+",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/GameAction",
    "userInteractionCount": "10000"
  },
  "gamePlatform": "Web Browser",
  "numberOfPlayers": "1",
  "playMode": "SinglePlayer"
};

// 游戏特定 Schema
const gameSchema = {
  "@context": "https://schema.org",
  "@type": "Game",
  "name": "Professional React Slot Machine",
  "genre": "Casino",
  "subGenre": "Slot Machine",
  "audience": {
    "@type": "PeopleAudience",
    "minAge": "18"
  },
  "gameTip": "Match 3 or more symbols on a payline to win. Higher value symbols = bigger payouts!"
};

/**
 * 创建并注入 JSON-LD 脚本
 */
function injectJsonLd() {
  // 创建主应用 Schema
  const script1 = document.createElement('script');
  script1.type = 'application/ld+json';
  script1.textContent = JSON.stringify(softwareAppSchema);
  document.head.appendChild(script1);

  // 创建游戏 Schema
  const script2 = document.createElement('script');
  script2.type = 'application/ld+json';
  script2.textContent = JSON.stringify(gameSchema);
  document.head.appendChild(script2);

  console.log('✅ JSON-LD structured data injected successfully');
}

// DOM 加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectJsonLd);
} else {
  injectJsonLd();
}
