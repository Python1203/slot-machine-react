/**
 * PsychologicalHooks - 变现诱导逻辑
 * 实现近失效应 (Near-Miss) 和音效叠加等心理学技巧
 */

class PsychologicalHooks {
  constructor(options = {}) {
    this.nearMissProbability = options.nearMissProbability || 0.3; // 30% 概率触发近失
    this.onNearMissTrigger = options.onNearMissTrigger || (() => {});
    this.soundManager = options.soundManager || null;
    
    // 音效配置
    this.soundConfig = {
      win: { baseVolume: 1, maxDuration: 3000 },
      nearMiss: { baseVolume: 0.8, duration: 500 },
      autoSpin: { baseVolume: 0.3, short: true }
    };
  }
  
  /**
   * 处理中奖结果，可能触发近失效应
   * @param {Object} result - 后端返回的中奖结果
   * @param {Array} targetReels - 目标卷轴符号
   * @returns {Object} 修改后的结果
   */
  processWinResult(result, targetReels) {
    // 如果已经中奖，直接返回
    if (result.is_win) {
      return { result, reels: targetReels };
    }
    
    // 检查是否触发近失效应
    const shouldTriggerNearMiss = this.shouldTriggerNearMiss();
    
    if (shouldTriggerNearMiss) {
      const modifiedReels = this.createNearMissReels(targetReels);
      
      console.log('🎯 触发近失效应');
      this.onNearMissTrigger({
        original: targetReels,
        modified: modifiedReels,
        type: 'near-miss'
      });
      
      return {
        result: { ...result, is_win: false },
        reels: modifiedReels
      };
    }
    
    return { result, reels: targetReels };
  }
  
  /**
   * 判断是否应该触发近失效应
   */
  shouldTriggerNearMiss() {
    // 基础概率
    const baseChance = this.nearMissProbability;
    
    // 可以根据用户行为动态调整
    // 例如：连续失败次数越多，概率越高
    const consecutiveLosses = this.getConsecutiveLosses();
    const adjustedChance = Math.min(baseChance + consecutiveLosses * 0.05, 0.6);
    
    return Math.random() < adjustedChance;
  }
  
  /**
   * 获取连续失败次数（需要从外部获取）
   */
  getConsecutiveLosses() {
    // 这里可以从游戏状态中获取
    return 0;
  }
  
  /**
   * 创建近失效果的卷轴排列
   * 让大奖符号出现在中奖线附近
   */
  createNearMissReels(originalReels) {
    const modifiedReels = [...originalReels];
    
    // 策略 1: 让一个卷轴的大奖符号停在离中奖线差一格的位置
    const rareSymbolIndex = this.findRareSymbolPosition(modifiedReels);
    
    if (rareSymbolIndex !== -1) {
      // 随机选择上移或下移一格
      const offset = Math.random() > 0.5 ? 1 : -1;
      const targetRow = (1 + offset + 3) % 3; // 确保在 0-2 范围内
      
      modifiedReels[rareSymbolIndex] = this.moveSymbolToRow(
        modifiedReels[rareSymbolIndex],
        targetRow
      );
    }
    
    // 策略 2: 让两个符号相同，第三个差一点
    const pairInfo = this.findMatchingPair(modifiedReels);
    if (pairInfo) {
      const thirdIndex = pairInfo.thirdIndex;
      const matchingSymbol = modifiedReels[pairInfo.firstIndex][1]; // 中间行的符号
      
      // 将第三个卷轴设置为与配对符号相邻的符号
      modifiedReels[thirdIndex] = this.setAdjacentSymbol(
        modifiedReels[thirdIndex],
        matchingSymbol.symbol
      );
    }
    
    return modifiedReels;
  }
  
  /**
   * 查找稀有符号位置
   */
  findRareSymbolPosition(reels) {
    const rareSymbols = ['7️⃣', '💎', '🔔'];
    
    for (let i = 0; i < reels.length; i++) {
      for (const symbol of reels[i]) {
        if (rareSymbols.includes(symbol.symbol)) {
          return i;
        }
      }
    }
    
    return -1;
  }
  
  /**
   * 移动符号到指定行
   */
  moveSymbolToRow(reel, targetRow) {
    const newReel = [...reel];
    const temp = newReel[targetRow];
    newReel[targetRow] = newReel[1]; // 将中间行的符号移到目标行
    newReel[1] = temp;
    return newReel;
  }
  
  /**
   * 查找配对的符号
   */
  findMatchingPair(reels) {
    for (let i = 0; i < reels.length - 1; i++) {
      for (let j = i + 1; j < reels.length; j++) {
        if (reels[i][1].symbol === reels[j][1].symbol) {
          // 找到一对
          const thirdIndex = reels.findIndex((_, idx) => idx !== i && idx !== j);
          return { firstIndex: i, secondIndex: j, thirdIndex };
        }
      }
    }
    
    return null;
  }
  
  /**
   * 设置为相邻符号
   */
  setAdjacentSymbol(reel, targetSymbol) {
    const SYMBOLS = ['🍒', '🍋', '🍇', '🍉', '🔔', '💎', '7️⃣'];
    const currentIndex = SYMBOLS.indexOf(targetSymbol);
    
    // 选择前一个或后一个符号
    const adjacentIndex = (currentIndex + (Math.random() > 0.5 ? 1 : -1) + SYMBOLS.length) % SYMBOLS.length;
    const adjacentSymbol = SYMBOLS[adjacentIndex];
    
    // 在 reel 中找到这个符号并放到中间行
    const newReel = [...reel];
    const symbolIndex = newReel.findIndex(s => s.symbol === adjacentSymbol);
    
    if (symbolIndex !== -1 && symbolIndex !== 1) {
      const temp = newReel[1];
      newReel[1] = newReel[symbolIndex];
      newReel[symbolIndex] = temp;
    }
    
    return newReel;
  }
  
  /**
   * 计算对数增长的音效参数
   * 中奖金额越高，音效频率越高，但增长递减
   */
  calculateSoundParameters(winAmount) {
    const baseAmount = 10;
    const logFactor = Math.log(winAmount / baseAmount);
    
    return {
      // 播放次数：对数增长
      playCount: Math.ceil(logFactor * 2),
      
      // 音调：随金额升高
      pitch: 0.5 + Math.min(logFactor * 0.1, 0.5),
      
      // 速度：随金额加快
      playbackRate: 1 + Math.min(logFactor * 0.05, 0.5),
      
      // 音量：限制在合理范围
      volume: Math.min(0.3 + logFactor * 0.1, 1.0),
      
      // 最大持续时间
      maxDuration: Math.min(logFactor * 1000, 5000)
    };
  }
  
  /**
   * 播放多条线同时中奖的音效
   */
  playMultiLineWinSound(winLines, totalAmount) {
    const params = this.calculateSoundParameters(totalAmount);
    
    if (this.soundManager) {
      // 叠加播放
      for (let i = 0; i < params.playCount; i++) {
        setTimeout(() => {
          this.soundManager.play('win', {
            volume: params.volume,
            playbackRate: params.playbackRate,
            detune: params.pitch * 100 // 音分
          });
        }, i * 200);
      }
    }
    
    console.log(`🎵 播放 ${winLines.length} 条中奖线音效，总金额：${totalAmount}`);
  }
  
  /**
   * 记录用户行为用于优化近失概率
   */
  trackUserBehavior(action, data) {
    // 可以发送到分析系统
    const analytics = {
      action,
      timestamp: Date.now(),
      ...data
    };
    
    console.log('📊 用户行为追踪:', analytics);
    
    // 根据行为调整策略
    if (action === 'spin' && !data.win) {
      // 连续失败，下次提高近失概率
      this.nearMissProbability = Math.min(this.nearMissProbability + 0.02, 0.5);
    } else if (action === 'spin' && data.win) {
      // 中奖后重置
      this.nearMissProbability = 0.3;
    }
  }
}

export default PsychologicalHooks;
