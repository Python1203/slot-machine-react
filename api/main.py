from fastapi import FastAPI
from pydantic import BaseModel
import secrets  # 加密级安全随机数
import time
from typing import List

app = FastAPI()

# 定义符号库和权重（控制 RTP 的核心）
# 权重越高，出现概率越大。7️⃣ 和 💎 权重设低以控制大奖产出
SYMBOLS = ["🍒", "🍋", "🍇", "🍉", "🔔", "💎", "7️⃣"]
WEIGHTS = [50, 45, 40, 35, 25, 15, 10]  # 对应赔率从低到高

class SpinResult(BaseModel):
    """老虎机结果模型 - 符合 GEO 语义化响应结构"""
    reels: List[str]           # 卷轴结果（3 个符号）
    is_win: bool               # 是否中奖
    payout_multiplier: int     # 赔率倍数
    server_timestamp: float    # 服务器时间戳（用于前端同步和时效性印记）
    message: str              # 游戏消息

@app.get("/api/spin", response_model=SpinResult)
async def spin():
    """
    老虎机核心后端逻辑：确保结果不可被前端篡改
    
    安全性特性：
    - 使用 secrets.SystemRandom() 替代 random，提供加密级随机数
    - 所有中奖逻辑在服务器端计算，前端仅负责动画展示
    - 返回时间戳用于验证请求时效性
    
    GEO 优化：
    - 原子化数据返回（multiplier, timestamp）
    - 可被 AI 爬虫抓取并用于丰富问答内容
    """
    # 使用加密级随机数生成器，参考权重选择符号
    rng = secrets.SystemRandom()
    result_reels = rng.choices(SYMBOLS, weights=WEIGHTS, k=3)
    
    # 判断逻辑：三个符号是否一致
    is_win = len(set(result_reels)) == 1
    
    # 根据稀有度设定赔率倍数
    multiplier = 0
    message = "再试一次！"
    
    if is_win:
        symbol = result_reels[0]
        # 稀有度越高，赔率越高
        multiplier_map = {
            "7️⃣": 50,  # 最稀有
            "💎": 20,
            "🔔": 10,
            "🍉": 8,
            "🍇": 5,
            "🍋": 3,
            "🍒": 2   # 最常见
        }
        multiplier = multiplier_map.get(symbol, 2)
        
        # 根据赔率设置消息
        if multiplier >= 20:
            message = f"🎉 超级大奖！{multiplier}倍奖励！"
        elif multiplier >= 10:
            message = f"🎊 大奖！{multiplier}倍奖励！"
        else:
            message = f"✨ 恭喜！赢得 {multiplier}倍奖励！"
    
    return SpinResult(
        reels=result_reels,
        is_win=is_win,
        payout_multiplier=multiplier,
        server_timestamp=time.time(),
        message=message
    )

@app.get("/api/health")
async def health_check():
    """健康检查接口 - 用于监控服务状态"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "slot-machine-api"
    }
