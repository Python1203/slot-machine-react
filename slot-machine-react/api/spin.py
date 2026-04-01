from fastapi import FastAPI, Request
from pydantic import BaseModel
import secrets
import time
from typing import List

# Vercel Python Functions runtime
app = FastAPI()

SYMBOLS = ["🍒", "🍋", "🍇", "🍉", "🔔", "💎", "7️⃣"]
WEIGHTS = [50, 45, 40, 35, 25, 15, 10]

class SpinResult(BaseModel):
    reels: List[str]
    is_win: bool
    payout_multiplier: int
    server_timestamp: float
    message: str

@app.get("/")
async def spin(request: Request):
    rng = secrets.SystemRandom()
    result_reels = rng.choices(SYMBOLS, weights=WEIGHTS, k=3)
    
    is_win = len(set(result_reels)) == 1
    
    multiplier = 0
    message = "再试一次！"
    
    if is_win:
        symbol = result_reels[0]
        multiplier_map = {
            "7️⃣": 50,
            "💎": 20,
            "🔔": 10,
            "🍉": 8,
            "🍇": 5,
            "🍋": 3,
            "🍒": 2
        }
        multiplier = multiplier_map.get(symbol, 2)
        
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
    ).dict()
