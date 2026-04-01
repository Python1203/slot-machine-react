"""
Slug 生成工具 - 用于创建 SEO 友好的语义化 URL
支持中文拼音和英文 slugify
"""

from pypinyin import lazy_pinyin, Style
import re
import unicodedata


class SlugGenerator:
    """Slug 生成器 - 将标题转换为 SEO 友好的 URL 别名"""
    
    @staticmethod
    def chinese_to_pinyin(text: str, separator: str = '-') -> str:
        """
        将中文文本转换为拼音 slug
        
        Args:
            text: 中文文本
            separator: 分隔符，默认为 '-'
            
        Returns:
            拼音 slug
            
        Examples:
            >>> SlugGenerator.chinese_to_pinyin("恭喜发财")
            'gong-xi-fa-cai'
            
            >>> SlugGenerator.chinese_to_pinyin("老虎机游戏")
            'lao-hu-ji-you-xi'
        """
        # 使用 pypinyin 转换为拼音
        pinyin_list = lazy_pinyin(text, style=Style.NORMAL)
        
        # 用分隔符连接
        slug = separator.join(pinyin_list)
        
        # 清理特殊字符
        slug = re.sub(r'[^\w\s-]', '', slug)
        
        return slug.lower()
    
    @staticmethod
    def english_slugify(text: str, separator: str = '-') -> str:
        """
        将英文文本转换为 slug
        
        Args:
            text: 英文文本
            separator: 分隔符，默认为 '-'
            
        Returns:
            英文 slug
            
        Examples:
            >>> SlugGenerator.english_slugify("Hello World Casino")
            'hello-world-casino'
            
            >>> SlugGenerator.english_slugify("Slot Machine Game")
            'slot-machine-game'
        """
        # 转换为小写
        slug = text.lower()
        
        # 移除特殊字符（保留字母、数字、空格和连字符）
        slug = re.sub(r'[^\w\s-]', '', slug)
        
        # 替换空格为分隔符
        slug = re.sub(r'[-\s]+', separator, slug)
        
        # 移除首尾空白
        slug = slug.strip('-_')
        
        return slug
    
    @staticmethod
    def auto_detect_and_convert(text: str, separator: str = '-') -> str:
        """
        自动检测语言并转换为 slug
        
        Args:
            text: 文本（中文或英文）
            separator: 分隔符，默认为 '-'
            
        Returns:
            转换后的 slug
            
        Examples:
            >>> SlugGenerator.auto_detect_and_convert("恭喜发财")
            'gong-xi-fa-cai'
            
            >>> SlugGenerator.auto_detect_and_convert("Casino Game")
            'casino-game'
        """
        # 检测是否包含中文字符
        has_chinese = any('\u4e00' <= char <= '\u9fff' for char in text)
        
        if has_chinese:
            return SlugGenerator.chinese_to_pinyin(text, separator)
        else:
            return SlugGenerator.english_slugify(text, separator)
    
    @staticmethod
    def generate_unique_slug(title: str, existing_slugs: list = None, separator: str = '-') -> str:
        """
        生成唯一的 slug（如果重复则添加数字后缀）
        
        Args:
            title: 标题
            existing_slugs: 已存在的 slug 列表
            separator: 分隔符
            
        Returns:
            唯一的 slug
            
        Examples:
            >>> SlugGenerator.generate_unique_slug("恭喜发财", ["gong-xi-fa-cai"])
            'gong-xi-fa-cai-1'
        """
        base_slug = SlugGenerator.auto_detect_and_convert(title, separator)
        
        if not existing_slugs:
            return base_slug
        
        # 如果不重复，直接返回
        if base_slug not in existing_slugs:
            return base_slug
        
        # 如果重复，添加数字后缀
        counter = 1
        while f"{base_slug}-{counter}" in existing_slugs:
            counter += 1
        
        return f"{base_slug}-{counter}"


# 便捷函数
def generate_slug(text: str, separator: str = '-') -> str:
    """快速生成 slug 的便捷函数"""
    return SlugGenerator.auto_detect_and_convert(text, separator)


if __name__ == "__main__":
    # 测试示例
    test_cases = [
        "恭喜发财",
        "老虎机游戏",
        "777 Casino",
        "Slot Machine Game",
        "赛博朋克赌场",
        "Cyberpunk 2077"
    ]
    
    print("Slug 生成测试：")
    print("=" * 50)
    for title in test_cases:
        slug = generate_slug(title)
        print(f"{title:20} -> {slug}")
    
    print("\n唯一性测试：")
    print("=" * 50)
    existing = ["gong-xi-fa-cai", "lao-hu-ji"]
    new_title = "恭喜发财"
    unique_slug = SlugGenerator.generate_unique_slug(new_title, existing)
    print(f"标题：{new_title}")
    print(f"已存在：{existing}")
    print(f"生成唯一 slug: {unique_slug}")
