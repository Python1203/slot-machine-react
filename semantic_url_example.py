"""
FastAPI 语义化 URL 示例 - 展示如何使用 Slug 实现 SEO 友好的路由
包含 GEO 优化的最佳实践
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from slug_generator import SlugGenerator
import time

app = FastAPI(
    title="Semantic URL API",
    description="演示如何使用 Slug 实现 SEO 友好的语义化 URL",
    version="1.0.0"
)


# ==================== 数据模型 ====================

class Article(BaseModel):
    """文章模型 - 展示如何使用 slug 作为唯一标识"""
    id: int
    title: str
    slug: str  # 语义化 URL 别名
    content: str
    category: str
    created_at: float
    tags: List[str] = []


class ArticleCreate(BaseModel):
    """创建文章请求模型"""
    title: str
    content: str
    category: str
    tags: List[str] = []


class Game(BaseModel):
    """游戏模型 - 用于赌场游戏示例"""
    id: int
    name: str
    slug: str
    description: str
    rtp: float  # Return to Player
    volatility: str  # 波动性：low/medium/high
    image_url: str


# ==================== 模拟数据库 ====================

# 内存中的文章存储（实际项目应使用数据库）
articles_db = {}
existing_slugs = set()

# 初始化一些示例文章
def init_sample_data():
    """初始化示例数据"""
    sample_articles = [
        {
            "id": 1,
            "title": "恭喜发财老虎机攻略",
            "content": "详细介绍 888 恭喜发财老虎机的玩法和技巧...",
            "category": "game-guides",
            "tags": ["老虎机", "攻略", "恭喜发财"]
        },
        {
            "id": 2,
            "title": "赛博朋克赌场体验",
            "content": "探索未来风格的在线赌场平台...",
            "category": "reviews",
            "tags": ["赛博朋克", "赌场", "评测"]
        },
        {
            "id": 3,
            "title": "Slot Machine Basics",
            "content": "Learn the fundamentals of slot machines...",
            "category": "guides",
            "tags": ["slots", "beginner", "guide"]
        }
    ]
    
    for article in sample_articles:
        slug = SlugGenerator.generate_unique_slug(
            article["title"], 
            list(existing_slugs)
        )
        article["slug"] = slug
        article["created_at"] = time.time()
        articles_db[slug] = Article(**article)
        existing_slugs.add(slug)

init_sample_data()


# ==================== API 路由 ====================

@app.get("/")
async def root():
    """
    API 根路径 - 展示可用的端点
    
    GEO 优化：
    - 清晰的端点描述
    - 结构化数据
    - 语义化命名
    """
    return {
        "service": "Semantic URL API",
        "version": "1.0.0",
        "description": "SEO-friendly slug-based routing system",
        "endpoints": {
            "articles_list": "/articles/",
            "article_detail": "/articles/{slug}",
            "games_list": "/games/",
            "game_detail": "/games/{slug}"
        },
        "geo_optimized": True
    }


@app.get("/articles/", response_model=List[Article])
async def list_articles(category: Optional[str] = None):
    """
    文章列表 - 支持按分类筛选
    
    GEO 优化：
    - 清晰的资源命名（复数形式）
    - 支持过滤参数
    - 返回结构化数据
    """
    if category:
        return [a for a in articles_db.values() if a.category == category]
    return list(articles_db.values())


@app.post("/articles/", response_model=Article)
async def create_article(article: ArticleCreate):
    """
    创建文章 - 自动生成 slug
    
    这个端点展示了：
    1. 如何根据标题自动生成 slug
    2. 确保 slug 唯一性
    3. 使用 slug 作为资源的唯一标识
    """
    # 生成唯一 slug
    slug = SlugGenerator.generate_unique_slug(
        article.title,
        list(existing_slugs)
    )
    
    # 创建文章
    new_id = len(articles_db) + 1
    new_article = Article(
        id=new_id,
        title=article.title,
        slug=slug,
        content=article.content,
        category=article.category,
        created_at=time.time(),
        tags=article.tags
    )
    
    # 保存到数据库
    articles_db[slug] = new_article
    existing_slugs.add(slug)
    
    return new_article


@app.get("/articles/{slug}", response_model=Article)
async def get_article(slug: str):
    """
    获取文章详情 - 使用 slug 替代 ID
    
    ✅ 正确示范：/articles/gong-xi-fa-cai-lao-hu-ji-gong-lue
    ❌ 错误示范：/articles/1
    
    GEO 优势：
    - URL 包含关键词，提升 SEO
    - AI 爬虫可以理解内容主题
    - 用户友好，易于记忆和分享
    """
    if slug not in articles_db:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return articles_db[slug]


@app.put("/articles/{slug}", response_model=Article)
async def update_article(slug: str, article: ArticleCreate):
    """更新文章 - slug 保持不变"""
    if slug not in articles_db:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # 更新文章信息（slug 不变）
    existing = articles_db[slug]
    updated = Article(
        id=existing.id,
        title=article.title,
        slug=slug,  # slug 保持不变
        content=article.content,
        category=article.category,
        created_at=existing.created_at,
        tags=article.tags
    )
    
    articles_db[slug] = updated
    return updated


@app.delete("/articles/{slug}")
async def delete_article(slug: str):
    """删除文章"""
    if slug not in articles_db:
        raise HTTPException(status_code=404, detail="Article not found")
    
    del articles_db[slug]
    existing_slugs.remove(slug)
    
    return {"message": f"Article '{slug}' deleted successfully"}


# ==================== 游戏相关路由 ====================

games_db = {
    "gong-xi-fa-cai": Game(
        id=1,
        name="恭喜发财",
        slug="gong-xi-fa-cai",
        description="经典中国主题老虎机",
        rtp=96.5,
        volatility="medium",
        image_url="/images/gong-xi-fa-cai.jpg"
    ),
    "cyberpunk-slots": Game(
        id=2,
        name="Cyberpunk Slots",
        slug="cyberpunk-slots",
        description="未来科技主题老虎机",
        rtp=97.2,
        volatility="high",
        image_url="/images/cyberpunk.jpg"
    ),
    "lucky-777": Game(
        id=3,
        name="Lucky 777",
        slug="lucky-777",
        description="经典幸运 7 老虎机",
        rtp=95.8,
        volatility="low",
        image_url="/images/lucky-777.jpg"
    )
}


@app.get("/games/", response_model=List[Game])
async def list_games(volatility: Optional[str] = None):
    """列出所有游戏 - 支持按波动性筛选"""
    if volatility:
        return [g for g in games_db.values() if g.volatility == volatility]
    return list(games_db.values())


@app.get("/games/{slug}", response_model=Game)
async def get_game(slug: str):
    """
    获取游戏详情 - 使用语义化 slug
    
    GEO 优化示例：
    ✅ /games/gong-xi-fa-cai (清晰表达游戏名称)
    ✅ /games/cyberpunk-slots (包含主题关键词)
    ❌ /games/1 (无意义 ID)
    """
    if slug not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return games_db[slug]


# ==================== Slug 生成工具端点 ====================

class SlugRequest(BaseModel):
    title: str


class SlugResponse(BaseModel):
    original: str
    slug: str
    language: str


@app.post("/generate-slug", response_model=SlugResponse)
async def generate_slug(request: SlugRequest):
    """
    生成 Slug - 提供 slug 生成服务
    
    自动检测语言并转换：
    - 中文 -> 拼音
    - 英文 -> slugify
    """
    has_chinese = any('\u4e00' <= char <= '\u9fff' for char in request.title)
    language = "chinese" if has_chinese else "english"
    
    slug = SlugGenerator.auto_detect_and_convert(request.title)
    
    return SlugResponse(
        original=request.title,
        slug=slug,
        language=language
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
