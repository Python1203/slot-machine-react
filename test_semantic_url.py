"""
语义化 URL 系统 - 完整演示脚本

展示内容：
1. Slug 生成（中文拼音、英文 slugify）
2. FastAPI 语义化路由
3. GEO 优化最佳实践
"""

import sys
from slug_generator import SlugGenerator, generate_slug


def print_section(title):
    """打印分节标题"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def demo_slug_generation():
    """演示 Slug 生成功能"""
    print_section("1. Slug 生成演示")
    
    test_cases = [
        # 中文标题
        "恭喜发财",
        "老虎机游戏完全攻略",
        "赛博朋克赌场体验",
        "888 幸运大转盘",
        
        # 英文标题
        "Slot Machine Guide",
        "Cyberpunk Casino Review",
        "Welcome Bonus 2024",
        "777 Lucky Spins",
        
        # 混合标题
        "Casino 888 攻略",
        "Slots 老虎机对比"
    ]
    
    print(f"\n{'原标题':<30} {'生成的 Slug':<40}")
    print("-" * 70)
    
    for title in test_cases:
        slug = generate_slug(title)
        print(f"{title:<30} {slug:<40}")


def demo_unique_slug():
    """演示唯一 Slug 生成"""
    print_section("2. 唯一 Slug 生成（避免重复）")
    
    existing_slugs = [
        "gong-xi-fa-cai",
        "lao-hu-ji-you-xi",
        "sai-bo-peng-ke"
    ]
    
    new_titles = [
        "恭喜发财",  # 重复，应添加后缀
        "恭喜发财新版本",  # 不重复
        "老虎机游戏"  # 不重复
    ]
    
    print(f"\n已存在的 Slugs: {existing_slugs}")
    print("\n生成新文章的 Slug:")
    
    for title in new_titles:
        unique_slug = SlugGenerator.generate_unique_slug(
            title, 
            existing_slugs
        )
        is_duplicate = unique_slug.replace("-1", "").replace("-2", "") in existing_slugs
        status = "⚠️ 重复（已添加后缀）" if is_duplicate else "✅ 无重复"
        print(f"{status} {title:<20} -> {unique_slug}")


def demo_url_comparison():
    """对比正确和错误的 URL 设计"""
    print_section("3. URL 设计对比（GEO 优化视角）")
    
    examples = [
        {
            "title": "恭喜发财老虎机评测",
            "correct": "/game-reviews/gong-xi-fa-cai-slot-machine",
            "wrong": "/article?id=123"
        },
        {
            "title": "老虎机策略指南",
            "correct": "/guides/slot-machine-strategy-tips",
            "wrong": "/page.php?cat=2&id=456"
        },
        {
            "title": "赛博朋克赌场",
            "correct": "/casino/cyberpunk-casino-review",
            "wrong": "/p/abc123def"
        }
    ]
    
    for example in examples:
        print(f"\n📄 文章：{example['title']}")
        print(f"   ✅ 正确：{example['correct']}")
        print(f"   ❌ 错误：{example['wrong']}")
        print(f"   🎯 优势：URL 包含关键词，AI 爬虫第一眼就能理解内容主题")


def demo_geo_benefits():
    """演示 GEO 优化的好处"""
    print_section("4. GEO 优化带来的好处")
    
    benefits = [
        {
            "方面": "AI 爬虫理解",
            "传统 ID": "需要分析页面内容才能猜测主题",
            "Slug URL": "从 URL 直接获取关键词（gong-xi-fa-cai = 恭喜发财）"
        },
        {
            "方面": "搜索引擎排名",
            "传统 ID": "/article?id=123 - 无任何 SEO 价值",
            "Slug URL": "/games/gong-xi-fa-cai - 包含搜索关键词"
        },
        {
            "方面": "用户体验",
            "传统 ID": "难以记忆和分享",
            "Slug URL": "直观易懂，便于口头传播"
        },
        {
            "方面": "点击率",
            "传统 ID": "用户不知道链接指向什么",
            "Slug URL": "看到 URL 就知道内容，提升点击欲望"
        }
    ]
    
    print(f"\n{'比较维度':<15} {'传统 ID 方式':<35} {'Slug 语义化 URL':<35}")
    print("-" * 90)
    
    for benefit in benefits:
        print(f"{benefit['方面']:<15} {benefit['传统 ID']:<35} {benefit['Slug URL']:<35}")


def demo_real_world_usage():
    """演示实际应用场景"""
    print_section("5. 实际应用场景")
    
    scenarios = [
        {
            "场景": "博客文章",
            "标题": "如何在老虎机中获胜",
            "预期 URL": "/blog/how-to-win-at-slot-machines",
            "生成结果": generate_slug("如何在老虎机中获胜")
        },
        {
            "场景": "游戏页面",
            "标题": "恭喜发财",
            "预期 URL": "/games/gong-xi-fa-cai",
            "生成结果": generate_slug("恭喜发财")
        },
        {
            "场景": "分类页面",
            "标题": "赌场评测",
            "预期 URL": "/category/casino-reviews",
            "生成结果": generate_slug("赌场评测")
        },
        {
            "场景": "促销活动",
            "标题": "888 欢迎奖金",
            "预期 URL": "/promotions/888-welcome-bonus",
            "生成结果": generate_slug("888 欢迎奖金")
        }
    ]
    
    for scenario in scenarios:
        print(f"\n📍 {scenario['场景']}")
        print(f"   标题：{scenario['标题']}")
        print(f"   预期：{scenario['预期 URL']}")
        print(f"   实际：/xxx/{scenario['生成结果']}")


def main():
    """主函数"""
    print("\n" + "🚀" * 30)
    print("语义化 URL 系统 - 完整演示")
    print("涵盖：Slug 生成 + FastAPI 路由 + GEO 优化")
    print("🚀" * 30)
    
    try:
        # 运行所有演示
        demo_slug_generation()
        demo_unique_slug()
        demo_url_comparison()
        demo_geo_benefits()
        demo_real_world_usage()
        
        print_section("✅ 演示完成")
        print("\n💡 下一步操作：")
        print("   1. 安装依赖：pip install pypinyin==0.52.0")
        print("   2. 运行 FastAPI 示例：python semantic_url_example.py")
        print("   3. 运行 GEO 优化器：python geo_optimizer.py")
        print("   4. 查看文档了解集成方法")
        
        print("\n📚 相关文件：")
        print("   - slug_generator.py      : Slug 生成核心库")
        print("   - semantic_url_example.py: FastAPI 完整示例")
        print("   - geo_optimizer.py       : GEO 优化最佳实践")
        print("   - requirements_slug.txt  : 依赖包列表")
        
    except Exception as e:
        print(f"\n❌ 发生错误：{e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
