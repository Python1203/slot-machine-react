/**
 * EconomyManager.js - 经济平衡管理器
 * 功能：金币管理、下注限额、稀缺度控制、广告/捐赠触发
 */

class EconomyManager {
  constructor(levelSystem) {
    this.levelSystem = levelSystem;
    this.coins = 1000; // 初始金币
    this.totalEarned = 0;
    this.totalSpent = 0;
    this.sessionSpins = 0;
    this.sessionWins = 0;
    
    // 稀缺度阈值
    this.scarcityThresholds = {
      critical: 0.1,    // 低于 10% 触发紧急广告
      low: 0.25,        // 低于 25% 触发广告提示
      medium: 0.5       // 低于 50% 显示捐赠提示
    };
    
    this.callbacks = {
      onCoinsChange: null,
      onScarcityTrigger: null,
      onBankrupt: null
    };
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    this.loadProgress();
  }
  
  /**
   * 计算当前等级的最大下注额
   */
  calculateMaxBet(baseMaxBet = 100) {
    const levelMultiplier = this.levelSystem.getMaxBetMultiplier();
    return Math.floor(baseMaxBet * levelMultiplier);
  }
  
  /**
   * 建议下注额（基于当前金币）
   */
  suggestBet(currentBet = 10) {
    const safePercentage = 0.05; // 安全下注：5% 金币
    const aggressivePercentage = 0.1; // 激进下注：10% 金币
    
    const suggestedSafe = Math.floor(this.coins * safePercentage);
    const suggestedAggressive = Math.floor(this.coins * aggressivePercentage);
    
    return {
      safe: Math.max(currentBet, suggestedSafe),
      aggressive: Math.max(currentBet, suggestedAggressive),
      max: this.calculateMaxBet()
    };
  }
  
  /**
   * 下注
   */
  placeBet(amount) {
    if (amount > this.coins) {
      return { success: false, message: '金币不足！' };
    }
    
    this.coins -= amount;
    this.totalSpent += amount;
    this.sessionSpins++;
    
    this.saveProgress();
    
    if (this.callbacks.onCoinsChange) {
      this.callbacks.onCoinsChange(this.coins);
    }
    
    // 检查稀缺度
    this.checkScarcity();
    
    return { success: true, remaining: this.coins };
  }
  
  /**
   * 赢得奖励
   */
  winReward(baseAmount, multiplier = 1) {
    const winBonus = this.levelSystem.getWinBonus();
    const finalAmount = Math.floor(baseAmount * multiplier * (1 + winBonus));
    
    this.coins += finalAmount;
    this.totalEarned += finalAmount;
    this.sessionWins++;
    
    this.saveProgress();
    
    if (this.callbacks.onCoinsChange) {
      this.callbacks.onCoinsChange(this.coins);
    }
    
    return finalAmount;
  }
  
  /**
   * 检查稀缺度
   */
  checkScarcity() {
    const maxBet = this.calculateMaxBet();
    const affordableBets = this.coins / maxBet;
    const scarcityRatio = this.coins / (maxBet * 20); // 以 20 次下注为基准
    
    let triggerType = null;
    let message = '';
    
    if (scarcityRatio <= this.scarcityThresholds.critical) {
      triggerType = 'critical';
      message = `⚠️ 金币严重不足！仅剩 ${this.coins} 金币，仅够转动 ${Math.floor(affordableBets)} 次`;
    } else if (scarcityRatio <= this.scarcityThresholds.low) {
      triggerType = 'low';
      message = `💰 金币紧张！剩余 ${this.coins} 金币，建议看广告获取免费金币`;
    } else if (scarcityRatio <= this.scarcityThresholds.medium) {
      triggerType = 'medium';
      message = `💡 金币不足？考虑捐赠获得永久加成和额外金币！`;
    }
    
    if (triggerType && this.callbacks.onScarcityTrigger) {
      this.callbacks.onScarcityTrigger(triggerType, message, {
        coins: this.coins,
        affordableBets: Math.floor(affordableBets),
        scarcityRatio: scarcityRatio.toFixed(2)
      });
    }
    
    return triggerType;
  }
  
  /**
   * 破产检查
   */
  checkBankruptcy() {
    const minBet = 10;
    if (this.coins < minBet) {
      if (this.callbacks.onBankrupt) {
        this.callbacks.onBankrupt(this.coins);
      }
      return true;
    }
    return false;
  }
  
  /**
   * 每日奖励
   */
  claimDailyReward() {
    const baseReward = 500;
    const dailyBonus = this.levelSystem.getDailyRewardBonus();
    const totalReward = Math.floor(baseReward * (1 + dailyBonus));
    
    this.coins += totalReward;
    this.saveProgress();
    
    if (this.callbacks.onCoinsChange) {
      this.callbacks.onCoinsChange(this.coins);
    }
    
    return {
      base: baseReward,
      bonus: dailyBonus * 100,
      total: totalReward
    };
  }
  
  /**
   * 观看广告奖励
   */
  watchAdReward(adType = 'video') {
    const rewards = {
      video: 200,      // 视频广告：200 金币
      interstitial: 100, // 插屏广告：100 金币
      rewarded: 300     // 激励广告：300 金币
    };
    
    const reward = rewards[adType] || 100;
    this.coins += reward;
    
    this.saveProgress();
    
    if (this.callbacks.onCoinsChange) {
      this.callbacks.onCoinsChange(this.coins);
    }
    
    return reward;
  }
  
  /**
   * 捐赠奖励（一次性）
   */
  donateReward(donationAmount) {
    const bonusMultiplier = 10; // 每$1 捐赠=10 金币
    const bonusCoins = donationAmount * bonusMultiplier;
    const xpBonus = donationAmount * 10; // 每$1 捐赠=10 XP
    
    this.coins += bonusCoins;
    
    // 记录到等级系统
    if (this.levelSystem) {
      this.levelSystem.recordDonation(donationAmount);
    }
    
    this.saveProgress();
    
    if (this.callbacks.onCoinsChange) {
      this.callbacks.onCoinsChange(this.coins);
    }
    
    return {
      coins: bonusCoins,
      xp: xpBonus,
      totalCoins: this.coins
    };
  }
  
  /**
   * 购买物品
   */
  purchaseItem(cost, itemType) {
    if (this.coins < cost) {
      return { success: false, message: '金币不足！' };
    }
    
    this.coins -= cost;
    this.saveProgress();
    
    if (this.callbacks.onCoinsChange) {
      this.callbacks.onCoinsChange(this.coins);
    }
    
    return { success: true, remaining: this.coins };
  }
  
  /**
   * 获取经济状态
   */
  getState() {
    const maxBet = this.calculateMaxBet();
    const scarcityRatio = this.coins / (maxBet * 20);
    
    return {
      coins: this.coins,
      totalEarned: this.totalEarned,
      totalSpent: this.totalSpent,
      netProfit: this.totalEarned - this.totalSpent,
      sessionSpins: this.sessionSpins,
      sessionWins: this.sessionWins,
      winRate: this.sessionSpins > 0 ? (this.sessionWins / this.sessionSpins * 100).toFixed(2) : 0,
      maxBet: maxBet,
      affordableBets: Math.floor(this.coins / maxBet),
      scarcityLevel: this.getScarcityLevel(scarcityRatio),
      suggestedBets: this.suggestBet()
    };
  }
  
  /**
   * 获取稀缺等级
   */
  getScarcityLevel(ratio) {
    if (ratio <= this.scarcityThresholds.critical) return 'critical';
    if (ratio <= this.scarcityThresholds.low) return 'low';
    if (ratio <= this.scarcityThresholds.medium) return 'medium';
    return 'healthy';
  }
  
  /**
   * 保存进度
   */
  saveProgress() {
    try {
      localStorage.setItem('economyProgress', JSON.stringify({
        coins: this.coins,
        totalEarned: this.totalEarned,
        totalSpent: this.totalSpent,
        sessionSpins: this.sessionSpins,
        sessionWins: this.sessionWins
      }));
    } catch (e) {
      console.warn('localStorage 保存失败:', e);
    }
  }
  
  /**
   * 加载进度
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('economyProgress');
      if (saved) {
        const data = JSON.parse(saved);
        this.coins = data.coins || 1000;
        this.totalEarned = data.totalEarned || 0;
        this.totalSpent = data.totalSpent || 0;
        this.sessionSpins = data.sessionSpins || 0;
        this.sessionWins = data.sessionWins || 0;
      }
    } catch (e) {
      console.warn('localStorage 加载失败:', e);
    }
  }
  
  /**
   * 注册回调
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = callback;
    }
  }
}

export default EconomyManager;
