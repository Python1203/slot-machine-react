/**
 * QuestSystem.js - 任务系统管理器
 * 功能：每日任务、成就任务、任务进度追踪
 */

class QuestSystem {
  constructor() {
    this.dailyQuests = [];
    this.achievements = [];
    this.playerProgress = {};
    this.callbacks = {
      onQuestComplete: null,
      onAchievementUnlock: null,
      onProgressUpdate: null
    };
    
    this.init();
  }
  
  /**
   * 初始化
   */
  init() {
    // 从 localStorage 加载进度
    this.loadProgress();
    
    // 检查是否需要刷新每日任务
    this.checkDailyReset();
    
    // 初始化每日任务
    if (this.dailyQuests.length === 0) {
      this.generateDailyQuests();
    }
    
    // 初始化成就
    this.initAchievements();
  }
  
  /**
   * 生成每日任务
   */
  generateDailyQuests() {
    const questTemplates = [
      {
        id: 'daily_spins_50',
        title: '🎰 幸运转动',
        description: '累计转动老虎机 50 次',
        type: 'spins',
        target: 50,
        reward: { xp: 100, coins: 50 },
        difficulty: 'easy'
      },
      {
        id: 'daily_win_big',
        title: '💰 大奖时刻',
        description: '赢得一次 100 倍以上的奖励',
        type: 'big_win',
        target: 1,
        multiplier: 100,
        reward: { xp: 200, coins: 200 },
        difficulty: 'medium'
      },
      {
        id: 'daily_bet_1000',
        title: '💎 豪客下注',
        description: '累计下注达到 1000',
        type: 'total_bet',
        target: 1000,
        reward: { xp: 150, coins: 100 },
        difficulty: 'medium'
      },
      {
        id: 'daily_combo',
        title: '🔥 连赢大师',
        description: '连续赢 3 次',
        type: 'win_streak',
        target: 3,
        reward: { xp: 250, coins: 300 },
        difficulty: 'hard'
      },
      {
        id: 'daily_nearmiss',
        title: '⚡ 差一点就赢了',
        description: '触发 10 次近失效果',
        type: 'near_miss',
        target: 10,
        reward: { xp: 80, coins: 50 },
        difficulty: 'easy'
      }
    ];
    
    // 随机选择 3 个每日任务
    const shuffled = questTemplates.sort(() => Math.random() - 0.5);
    this.dailyQuests = shuffled.slice(0, 3).map(quest => ({
      ...quest,
      progress: this.playerProgress.quests?.[quest.id]?.progress || 0,
      completed: this.playerProgress.quests?.[quest.id]?.completed || false,
      claimed: this.playerProgress.quests?.[quest.id]?.claimed || false,
      date: new Date().toDateString()
    }));
    
    this.saveProgress();
  }
  
  /**
   * 初始化成就系统
   */
  initAchievements() {
    this.achievements = [
      {
        id: 'achievement_first_spin',
        title: '🎯 初次尝试',
        description: '完成第一次转动',
        type: 'spins',
        target: 1,
        reward: { xp: 50, badge: '新手勋章' },
        tier: 'bronze'
      },
      {
        id: 'achievement_century',
        title: '💯 百转成金',
        description: '累计转动 100 次',
        type: 'spins',
        target: 100,
        reward: { xp: 500, badge: '青铜玩家' },
        tier: 'bronze'
      },
      {
        id: 'achievement_jackpot',
        title: '🏆 头奖得主',
        description: '赢得一次 500 倍以上的大奖',
        type: 'big_win',
        target: 1,
        multiplier: 500,
        reward: { xp: 1000, badge: '幸运之星', coins: 1000 },
        tier: 'gold'
      },
      {
        id: 'achievement_millionaire',
        title: '💎 百万富翁',
        description: '累计拥有 1,000,000 金币',
        type: 'total_coins',
        target: 1000000,
        reward: { xp: 5000, badge: '钻石大亨', coins: 10000 },
        tier: 'diamond'
      },
      {
        id: 'achievement_marathon',
        title: '🏃 马拉松选手',
        description: '累计转动 10,000 次',
        type: 'spins',
        target: 10000,
        reward: { xp: 10000, badge: '传奇玩家', coins: 50000 },
        tier: 'legendary'
      },
      {
        id: 'achievement_donor',
        title: '❤️ 慈善家',
        description: '进行首次捐赠',
        type: 'donate',
        target: 1,
        reward: { xp: 2000, badge: '慈善勋章', special: true },
        tier: 'special'
      }
    ];
  }
  
  /**
   * 更新进度
   */
  updateProgress(actionType, data) {
    let changed = false;
    
    // 更新每日任务进度
    this.dailyQuests.forEach(quest => {
      if (quest.completed || quest.claimed) return;
      
      let newProgress = quest.progress;
      
      switch (quest.type) {
        case 'spins':
          if (actionType === 'spin') {
            newProgress += 1;
          }
          break;
        case 'big_win':
          if (actionType === 'win' && data.multiplier >= quest.multiplier) {
            newProgress += 1;
          }
          break;
        case 'total_bet':
          if (actionType === 'bet') {
            newProgress += data.amount;
          }
          break;
        case 'win_streak':
          if (actionType === 'win_streak') {
            newProgress = Math.max(newProgress, data.streak);
          }
          break;
        case 'near_miss':
          if (actionType === 'near_miss') {
            newProgress += 1;
          }
          break;
        default:
          break;
      }
      
      if (newProgress > quest.progress) {
        quest.progress = newProgress;
        changed = true;
        
        // 检查是否完成
        if (quest.progress >= quest.target) {
          quest.completed = true;
          this.onQuestComplete(quest);
        }
      }
    });
    
    // 更新成就进度
    this.achievements.forEach(achievement => {
      if (this.isAchievementUnlocked(achievement.id)) return;
      
      let newProgress = this.getPlayerProgressForType(achievement.type);
      
      switch (achievement.type) {
        case 'spins':
          if (actionType === 'spin') {
            newProgress += 1;
          }
          break;
        case 'big_win':
          if (actionType === 'win' && data.multiplier >= achievement.multiplier) {
            newProgress += 1;
          }
          break;
        case 'total_coins':
          if (actionType === 'coins_update') {
            newProgress = data.totalCoins;
          }
          break;
        case 'donate':
          if (actionType === 'donate') {
            newProgress += 1;
          }
          break;
        default:
          break;
      }
      
      this.setPlayerProgressForType(achievement.type, newProgress);
      
      // 检查是否解锁成就
      if (newProgress >= achievement.target) {
        this.unlockAchievement(achievement);
      }
    });
    
    if (changed) {
      this.saveProgress();
      if (this.callbacks.onProgressUpdate) {
        this.callbacks.onProgressUpdate(this.getQuestsState());
      }
    }
  }
  
  /**
   * 领取任务奖励
   */
  claimQuestReward(questId) {
    const quest = this.dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) {
      return { success: false, message: '无法领取奖励' };
    }
    
    quest.claimed = true;
    this.saveProgress();
    
    if (this.callbacks.onQuestComplete) {
      this.callbacks.onQuestComplete(quest, 'reward_claimed');
    }
    
    return {
      success: true,
      reward: quest.reward,
      message: `✅ 领取成功！获得 ${quest.reward.xp} XP + ${quest.reward.coins} 金币`
    };
  }
  
  /**
   * 解锁成就
   */
  unlockAchievement(achievement) {
    if (!this.playerProgress.achievements) {
      this.playerProgress.achievements = [];
    }
    
    if (!this.playerProgress.achievements.includes(achievement.id)) {
      this.playerProgress.achievements.push(achievement.id);
      this.saveProgress();
      
      console.log(`🏆 成就解锁：${achievement.title}`);
      
      if (this.callbacks.onAchievementUnlock) {
        this.callbacks.onAchievementUnlock(achievement);
      }
    }
  }
  
  /**
   * 检查成就是否已解锁
   */
  isAchievementUnlocked(achievementId) {
    return this.playerProgress.achievements?.includes(achievementId) || false;
  }
  
  /**
   * 获取玩家某类型的进度
   */
  getPlayerProgressForType(type) {
    return this.playerProgress.stats?.[type] || 0;
  }
  
  /**
   * 设置玩家某类型的进度
   */
  setPlayerProgressForType(type, value) {
    if (!this.playerProgress.stats) {
      this.playerProgress.stats = {};
    }
    this.playerProgress.stats[type] = value;
  }
  
  /**
   * 任务完成回调
   */
  onQuestComplete(quest) {
    console.log(`✅ 任务完成：${quest.title}`);
  }
  
  /**
   * 检查每日重置
   */
  checkDailyReset() {
    const lastDate = this.playerProgress.lastDailyReset;
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      // 新的一天，重置每日任务
      this.dailyQuests = [];
      this.playerProgress.quests = {};
      this.playerProgress.lastDailyReset = today;
      this.generateDailyQuests();
    }
  }
  
  /**
   * 保存进度到 localStorage
   */
  saveProgress() {
    try {
      localStorage.setItem('questProgress', JSON.stringify(this.playerProgress));
    } catch (e) {
      console.warn('localStorage 保存失败:', e);
    }
  }
  
  /**
   * 从 localStorage 加载进度
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('questProgress');
      if (saved) {
        this.playerProgress = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('localStorage 加载失败:', e);
      this.playerProgress = {};
    }
  }
  
  /**
   * 获取任务状态
   */
  getQuestsState() {
    return {
      daily: this.dailyQuests,
      achievements: this.achievements.map(a => ({
        ...a,
        unlocked: this.isAchievementUnlocked(a.id),
        progress: this.getPlayerProgressForType(a.type)
      }))
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

export default QuestSystem;
