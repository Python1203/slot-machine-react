"""
GEO 优化指南 - AI 爬虫友好的 URL 结构设计

本模块展示如何设计对 AI 爬虫和搜索引擎友好的 URL 结构
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict
import time


app = FastAPI(
    title="GEO Optimized API",
    description="AI Crawler Friendly URL Structure",
    version="1.0.0"
)


# ==================== GEO 优化原则 ====================

"""
✅ 正确的 URL 设计（语义化）：
1. /games/gong-xi-fa-cai-slot-machine
2. /articles/how-to-win-at-slots
3. /casino/reviews/cyberpunk-casino
4. /bonuses/welcome-bonus-888

❌ 错误的 URL 设计（无意义 ID）：
1. /games/123
2. /articles?id=456
3. /page.php?cat=2&id=789
4. /p/abc123def

GEO 优化关键点：
1. URL 包含关键词（AI 爬虫第一眼就能理解内容）
2. 使用连字符分隔单词（-）
3. 全部小写，避免大小写混乱
4. 避免特殊字符和参数
5. 层级清晰，不超过 3-4 级
"""


# ==================== 数据模型 ====================

class SEOMetadata(BaseModel):
    """SEO 元数据 - 用于丰富 AI 爬虫抓取的上下文"""
    title: str
    description: str
    keywords: List[str]
    canonical_url: str
    og_image: str
    article_type: str
    published_time: str
    author: str


class ContentPage(BaseModel):
    """内容页面模型 - 包含完整的 SEO 信息"""
    slug: str
    title: str
    content: str
    category: str
    tags: List[str]
    seo: SEOMetadata
    last_updated: float


# ==================== 模拟数据库 ====================

content_pages = {
    "gong-xi-fa-cai-slot-review": ContentPage(
        slug="gong-xi-fa-cai-slot-review",
        title="恭喜发财老虎机评测 - RTP 96.5% 高回报游戏详解",
        content="恭喜发财是一款经典的中国主题老虎机游戏...",
        category="game-reviews",
        tags=["老虎机", "恭喜发财", "RTP", "评测"],
        seo=SEOMetadata(
            title="恭喜发财老虎机评测 | RTP 96.5% | 在线试玩攻略",
            description="详细评测恭喜发财老虎机，包括 RTP 赔率、奖金机制、免费旋转玩法。专业分析帮助您了解这款高回报游戏的获胜技巧。",
            keywords=["恭喜发财", "老虎机", "RTP", "赌场游戏", "在线老虎机"],
            canonical_url="https://yourcasino.com/game-reviews/gong-xi-fa-cai-slot-review",
            og_image="https://yourcasino.com/images/gong-xi-fa-cai-review.jpg",
            article_type="GameReview",
            published_time="2024-01-15T10:00:00Z",
            author="Slot Expert"
        ),
        last_updated=time.time()
    ),
    
    "cyberpunk-casino-experience": ContentPage(
        slug="cyberpunk-casino-experience",
        title="赛博朋克赌场体验 - 未来科技与博彩的完美结合",
        content="探索 2077 风格的赛博朋克在线赌场平台...",
        category="casino-reviews",
        tags=["赛博朋克", "赌场", "科技", "未来"],
        seo=SEOMetadata(
            title="赛博朋克赌场 | 2077 未来风格 | 沉浸式游戏体验",
            description="体验最前卫的赛博朋克主题赌场，融合未来科技元素与传统博彩娱乐。独特的视觉效果，创新的玩法机制。",
            keywords=["赛博朋克", "赌场", "2077", "未来科技", "在线博彩"],
            canonical_url="https://yourcasino.com/casino-reviews/cyberpunk-casino-experience",
            og_image="https://yourcasino.com/images/cyberpunk-casino.jpg",
            article_type="Review",
            published_time="2024-02-20T14:30:00Z",
            author="Casino Reviewer"
        ),
        last_updated=time.time()
    ),
    
    "slot-machine-strategy-guide": ContentPage(
        slug="slot-machine-strategy-guide",
        title="老虎机策略完全指南 - 提高胜率的 10 个专业技巧",
        content="学习如何通过 RTP 选择、资金管理、奖金利用等策略...",
        category="guides",
        tags=["策略", "老虎机", "技巧", "RTP", "资金管"],
        seo=SEOMetadata(
            title="老虎机策略指南 | 10 个专业技巧 | 提高胜率方法",
            description="掌握老虎机获胜策略：了解 RTP 含义，学会资金管理，最大化奖金收益。来自行业专家的专业建议和实战技巧。",
            keywords=["老虎机策略", "RTP", "资金管理", "赌场技巧", "获胜方法"],
            canonical_url="https://yourcasino.com/guides/slot-machine-strategy-guide",
            og_image="https://yourcasino.com/images/slot-strategy.jpg",
            article_type="Guide",
            published_time="2024-03-10T09:00:00Z",
            author="Strategy Master"
        ),
        last_updated=time.time()
    )
}


# ==================== GEO 优化的路由设计 ====================

@app.get("/")
async def root():
    """
    根路径 - 提供清晰的站点地图
    
    GEO 优化要点：
    1. 端点命名语义化（articles, games, guides）
    2. 返回结构化导航信息
    3. 包含人类可读的描述
    """
    return {
        "site": "Your Casino - Professional Gaming Platform",
        "description": "High-quality casino games, reviews, and strategy guides",
        "sitemap": {
            "games": "/games/",
            "reviews": "/reviews/",
            "guides": "/guides/",
            "bonuses": "/bonuses/"
        },
        "featured_content": [
            {
                "title": "恭喜发财 Slot Review",
                "url": "/game-reviews/gong-xi-fa-cai-slot-review",
                "type": "review"
            },
            {
                "title": "Slot Strategy Guide",
                "url": "/guides/slot-machine-strategy-guide",
                "type": "guide"
            }
        ],
        "geo_optimized": True,
        "crawler_friendly": True
    }


@app.get("/game-reviews/{slug}")
async def get_game_review(slug: str):
    """
    游戏评测详情页 - GEO 优化的典范
    
    URL 结构分析：
    ✅ /game-reviews/gong-xi-fa-cai-slot-review
    
    优势：
    1. 包含分类信息（game-reviews）
    2. 包含游戏名称（gong-xi-fa-cai）
    3. 包含内容类型（slot-review）
    4. AI 爬虫可以准确理解页面主题
    
    AI 爬虫抓取的信息层次：
    - 第一层：这是一个游戏评测（game-reviews）
    - 第二层：评测对象是恭喜发财（gong-xi-fa-cai）
    - 第三层：内容是关于老虎机（slot-review）
    """
    if slug not in content_pages:
        return {"error": "Page not found"}
    
    page = content_pages[slug]
    
    # 返回完整页面数据，包含丰富的 SEO 元数据
    return {
        "content": {
            "slug": page.slug,
            "title": page.title,
            "body": page.content,
            "category": page.category,
            "tags": page.tags
        },
        "seo_metadata": page.seo.dict(),
        "structured_data": {
            "@context": "https://schema.org",
            "@type": page.seo.article_type,
            "headline": page.title,
            "description": page.seo.description,
            "keywords": ",".join(page.seo.keywords),
            "url": page.seo.canonical_url,
            "image": page.seo.og_image,
            "datePublished": page.seo.published_time,
            "author": {
                "@type": "Person",
                "name": page.seo.author
            }
        },
        "geo_signals": {
            "url_semantics": "high",
            "keyword_density": len(page.tags),
            "content_category": page.category,
            "ai_crawler_ready": True
        }
    }


@app.get("/guides/{slug}")
async def get_guide(slug: str):
    """
    策略指南页面 - 另一种内容类型
    
    URL 示例：
    ✅ /guides/slot-machine-strategy-guide
    
    与 game-reviews 的区别：
    - guides: 教学类、策略类内容
    - game-reviews: 游戏评测类内容
    
    这种分类帮助 AI 爬虫：
    1. 理解内容意图（教学 vs 评测）
    2. 分配不同的抓取优先级
    3. 建立知识图谱关联
    """
    if slug not in content_pages:
        return {"error": "Page not found"}
    
    page = content_pages[slug]
    return {
        "guide": {
            "title": page.title,
            "content": page.content,
            "difficulty": "intermediate",
            "reading_time": "10 minutes",
            "tags": page.tags
        },
        "seo": page.seo.dict()
    }


@app.get("/api/breadcrumbs/{slug}")
async def get_breadcrumbs(slug: str):
    """
    面包屑导航 - 增强网站结构理解
    
    GEO 优化：
    提供清晰的层级关系，帮助 AI 爬虫理解网站架构
    
    示例输出：
    Home > Game Reviews > Slot Reviews > Gong Xi Fa Cai
    """
    breadcrumb_map = {
        "gong-xi-fa-cai-slot-review": [
            {"label": "Home", "url": "/"},
            {"label": "Game Reviews", "url": "/game-reviews/"},
            {"label": "Slot Reviews", "url": "/game-reviews/?type=slots"},
            {"label": "Gong Xi Fa Cai", "url": f"/game-reviews/{slug}"}
        ],
        "cyberpunk-casino-experience": [
            {"label": "Home", "url": "/"},
            {"label": "Casino Reviews", "url": "/casino-reviews/"},
            {"label": "Cyberpunk Experience", "url": f"/casino-reviews/{slug}"}
        ],
        "slot-machine-strategy-guide": [
            {"label": "Home", "url": "/"},
            {"label": "Guides", "url": "/guides/"},
            {"label": "Strategy", "url": "/guides/?type=strategy"},
            {"label": "Slot Machine Guide", "url": f"/guides/{slug}"}
        ]
    }
    
    breadcrumbs = breadcrumb_map.get(slug, [])
    return {
        "breadcrumbs": breadcrumbs,
        "structured_data": {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": item["label"],
                    "item": item["url"]
                }
                for i, item in enumerate(breadcrumbs)
            ]
        }
    }


# ==================== 批量生成 Slug 的工具 ====================

@app.post("/batch-generate-slugs")
async def batch_generate_slugs(titles: List[str]):
    """
    批量生成 Slug - 为大量内容快速创建语义化 URL
    
    请求示例：
    ["恭喜发财", "赛博朋克赌场", "老虎机攻略"]
    
    响应示例：
    ["gong-xi-fa-cai", "sai-bo-peng-ke-du-chang", "lao-hu-ji-gong-lue"]
    """
    from slug_generator import SlugGenerator
    
    results = []
    for title in titles:
        slug = SlugGenerator.auto_detect_and_convert(title)
        results.append({
            "original": title,
            "slug": slug
        })
    
    return {
        "generated": results,
        "count": len(results),
        "language_detected": "auto"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
