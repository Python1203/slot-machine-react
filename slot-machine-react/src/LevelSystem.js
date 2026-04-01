/**
 * LevelSystem.js - 等级与勋章系统
 * 功能：经验值管理、等级提升、勋章解锁、特权系统
 */

class LevelSystem {
  constructor() {
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.badges = [];
    this.unlockedFeatures = {};
    this.callbacks = {
      onLevelUp: null,
      onBadgeUnlock: null,
      onFeatureUnlock: null,
      onXPChange: null
    };
    
    // 等级配置表
    this.levelConfig = this.generateLevelCurve();
    
    // 勋章配置
    this.badgeConfig = this.initBadgeConfig();
    
    // 特性解锁配置
    this.featureConfig = this.initFeatureConfig();
    
    this.init();
  }
  
  /**
   * 生成等级曲线（指数增长）- 调整后的数值
   */
  generateLevelCurve() {
    const config = [];
    let baseXP = 100;
    let multiplier = 1.3; // 降低增长系数，从 1.5 改为 1.3
    
    for (let i = 1; i <= 100; i++) {
      config[i] = {
        level: i,
        xpRequired: Math.floor(baseXP * Math.pow(multiplier, i - 1)),
        maxBetMultiplier: 1 + (i - 1) * 0.05, // 每级 +5% 最大下注（从 10% 降到 5%）
        winBonus: i * 0.005, // 每级 +0.5% 赢钱奖励（从 1% 降到 0.5%）
        dailyRewardBonus: i * 0.01, // 每级 +1% 每日奖励（从 2% 降到 1%）
        unlockColor: i % 10 === 0 ? this.getTierColor(i) : null
      };
    }
    
    return config;
  }
  
  /**
   * 获取等级颜色
   */
  getTierColor(level) {
    if (level >= 90) return '#b9f2ff'; // 神话 - 青色
    if (level >= 70) return '#a335ee'; // 史诗 - 紫色
    if (level >= 50) return '#0070dd'; // 稀有 - 蓝色
    if (level >= 30) return '#1eff00'; // 优秀 - 绿色
    if (level >= 10) return '#ffd700'; // 普通 - 金色
    return '#ffffff'; // 白色
  }
  
  /**
   * 初始化勋章配置
   */
  initBadgeConfig() {
    return [
      {
        id: 'badge_newbie',
        name: '新手上路',
        description: '达到等级 5',
        requiredLevel: 5,
        icon: '🥉',
        tier: 'bronze'
      },
      {
        id: 'badge_regular',
        name: '常客玩家',
        description: '达到等级 10',
        requiredLevel: 10,
        icon: '🎖️',
        tier: 'silver'
      },
      {
        id: 'badge_veteran',
        name: '资深玩家',
        description: '达到等级 25',
        requiredLevel: 25,
        icon: '⭐',
        tier: 'gold'
      },
      {
        id: 'badge_elite',
        name: '精英玩家',
        description: '达到等级 50',
        requiredLevel: 50,
        icon: '💎',
        tier: 'diamond'
      },
      {
        id: 'badge_legend',
        name: '传奇人物',
        description: '达到等级 75',
        requiredLevel: 75,
        icon: '👑',
        tier: 'legendary'
      },
      {
        id: 'badge_donor_bronze',
        name: '支持者',
        description: '捐赠 $50+',
        requiredDonation: 50,
        icon: '❤️',
        tier: 'special'
      },
      {
        id: 'badge_donor_silver',
        name: '合作伙伴',
        description: '捐赠 $200+',
        requiredDonation: 200,
        icon: '🤝',
        tier: 'special'
      },
      {
        id: 'badge_donor_gold',
        name: '战略赞助商',
        description: '捐赠 $1000+',
        requiredDonation: 1000,
        icon: '🏆',
        tier: 'special'
      }
    ];
  }
  
  /**
   * 初始化特性解锁配置
   */
  initFeatureConfig() {
    return [
      {
        id: 'room_high_roller',
        name: '豪客房间',
        description: '进入高倍率房间（最大下注 x5）',
        requiredLevel: 15,
        type: 'room',
        effect: { maxBetMultiplier: 5 }
      },
      {
        id: 'room_vip',
        name: 'VIP 房间',
        description: '进入 VIP 专属房间（最大下注 x10）',
        requiredLevel: 40,
        type: 'room',
        effect: { maxBetMultiplier: 10 }
      },
      {
        id: 'skin_gold',
        name: '黄金皮肤',
        description: '解锁黄金老虎机皮肤',
        requiredLevel: 20,
        type: 'cosmetic',
        effect: { skin: 'gold' }
      },
      {
        id: 'skin_diamond',
        name: '钻石皮肤',
        description: '解锁钻石老虎机皮肤',
        requiredLevel: 60,
        type: 'cosmetic',
        effect: { skin: 'diamond' }
      },
      {
        id: 'auto_spin',
        name: '自动旋转',
        description: '解锁自动旋转功能',
        requiredLevel: 10,
        type: 'feature',
        effect: { autoSpin: true }
      },
      {
        id: 'turbo_mode',
        name: '极速模式',
        description: '解锁极速旋转模式',
        requiredLevel: 30,
        type: 'feature',
        effect: { turboMode: true }
      }
    ];
  }
  
  /**
   * 初始化
   */
  init() {
    this.loadProgress();
    this.checkUnlocks();
  }
  
  /**
   * 添加经验值
   */
  addXP(amount) {
    const oldLevel = this.level;
    this.xp += amount;
    
    // 检查升级
    while (this.xp >= this.xpToNextLevel && this.level < 100) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = this.levelConfig[this.level].xpRequired;
      
      console.log(`🎉 升级！当前等级：${this.level}`);
      
      // 触发升级回调
      if (this.callbacks.onLevelUp) {
        this.callbacks.onLevelUp(this.level, oldLevel);
      }
      
      // 检查新的解锁
      this.checkUnlocks();
    }
    
    // 保存进度
    this.saveProgress();
    
    // XP 变化回调
    if (this.callbacks.onXPChange) {
      this.callbacks.onXPChange(this.xp, this.xpToNextLevel);
    }
  }
  
  /**
   * 检查解锁
   */
  checkUnlocks() {
    // 检查勋章解锁
    this.badgeConfig.forEach(badge => {
      if (!this.badges.includes(badge.id)) {
        if (badge.requiredLevel && this.level >= badge.requiredLevel) {
          this.unlockBadge(badge);
        }
      }
    });
    
    // 检查特性解锁
    this.featureConfig.forEach(feature => {
      if (!this.unlockedFeatures[feature.id]) {
        if (feature.requiredLevel && this.level >= feature.requiredLevel) {
          this.unlockFeature(feature);
        }
      }
    });
  }
  
  /**
   * 解锁勋章
   */
  unlockBadge(badge) {
    this.badges.push(badge.id);
    console.log(`🏅 解锁勋章：${badge.name}`);
    
    if (this.callbacks.onBadgeUnlock) {
      this.callbacks.onBadgeUnlock(badge);
    }
    
    this.saveProgress();
  }
  
  /**
   * 解锁特性
   */
  unlockFeature(feature) {
    this.unlockedFeatures[feature.id] = true;
    console.log(`🔓 解锁特性：${feature.name}`);
    
    if (this.callbacks.onFeatureUnlock) {
      this.callbacks.onFeatureUnlock(feature);
    }
    
    this.saveProgress();
  }
  
  /**
   * 检查特性是否已解锁
   */
  isFeatureUnlocked(featureId) {
    return !!this.unlockedFeatures[featureId];
  }
  
  /**
   * 检查勋章是否已解锁
   */
  hasBadge(badgeId) {
    return this.badges.includes(badgeId);
  }
  
  /**
   * 获取最大下注倍数
   */
  getMaxBetMultiplier() {
    return this.levelConfig[this.level]?.maxBetMultiplier || 1;
  }
  
  /**
   * 获取赢钱奖励加成
   */
  getWinBonus() {
    return this.levelConfig[this.level]?.winBonus || 0;
  }
  
  /**
   * 获取每日奖励加成
   */
  getDailyRewardBonus() {
    return this.levelConfig[this.level]?.dailyRewardBonus || 0;
  }
  
  /**
   * 保存进度
   */
  saveProgress() {
    try {
      localStorage.setItem('levelProgress', JSON.stringify({
        level: this.level,
        xp: this.xp,
        badges: this.badges,
        unlockedFeatures: this.unlockedFeatures,
        totalDonation: this.totalDonation || 0
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
      const saved = localStorage.getItem('levelProgress');
      if (saved) {
        const data = JSON.parse(saved);
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.badges = data.badges || [];
        this.unlockedFeatures = data.unlockedFeatures || {};
        this.totalDonation = data.totalDonation || 0;
        this.xpToNextLevel = this.levelConfig[this.level]?.xpRequired || 100;
        
        // 检查捐赠勋章
        this.checkDonationBadges();
      }
    } catch (e) {
      console.warn('localStorage 加载失败:', e);
    }
  }
  
  /**
   * 记录捐赠
   */
  recordDonation(amount) {
    this.totalDonation = (this.totalDonation || 0) + amount;
    this.addXP(Math.floor(amount * 10)); // 每$1 捐赠=10 XP
    
    this.checkDonationBadges();
    this.saveProgress();
  }
  
  /**
   * 检查捐赠勋章
   */
  checkDonationBadges() {
    this.badgeConfig.forEach(badge => {
      if (badge.requiredDonation && !this.hasBadge(badge.id)) {
        if (this.totalDonation >= badge.requiredDonation) {
          this.unlockBadge(badge);
        }
      }
    });
  }
  
  /**
   * 获取状态
   */
  getState() {
    return {
      level: this.level,
      xp: this.xp,
      xpToNextLevel: this.xpToNextLevel,
      badges: this.badges.map(id => this.badgeConfig.find(b => b.id === id)),
      unlockedFeatures: Object.keys(this.unlockedFeatures),
      maxBetMultiplier: this.getMaxBetMultiplier(),
      winBonus: this.getWinBonus(),
      progress: (this.xp / this.xpToNextLevel) * 100
    };
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

export default LevelSystem;
