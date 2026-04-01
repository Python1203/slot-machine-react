import React, { useState, useEffect } from 'react';
import './QuestPanel.css';

const QuestPanel = ({ questSystem, levelSystem, economyManager, onClose }) => {
  const [questsState, setQuestsState] = useState(null);
  const [levelState, setLevelState] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    updateStates();
    
    // 监听更新
    if (questSystem) {
      questSystem.on('onProgressUpdate', updateStates);
      questSystem.on('onQuestComplete', handleQuestComplete);
    }
    
    if (levelSystem) {
      levelSystem.on('onLevelUp', handleLevelUp);
      levelSystem.on('onBadgeUnlock', handleBadgeUnlock);
    }
    
    if (economyManager) {
      economyManager.on('onCoinsChange', updateStates);
      economyManager.on('onScarcityTrigger', handleScarcityTrigger);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStates = () => {
    if (questSystem) setQuestsState(questSystem.getQuestsState());
    if (levelSystem) setLevelState(levelSystem.getState());
  };

  const handleQuestComplete = (quest, type) => {
    if (type === 'reward_claimed') {
      alert(`🎉 ${quest.message}`);
    } else {
      // 显示完成通知
      showNotification(`✅ 任务完成：${quest.title}`, 'success');
    }
  };

  const handleLevelUp = (newLevel, oldLevel) => {
    showNotification(`🎉 恭喜升级！Lv.${oldLevel} → Lv.${newLevel}`, 'legendary');
  };

  const handleBadgeUnlock = (badge) => {
    showNotification(`🏅 解锁勋章：${badge.name}`, 'gold');
  };

  const handleScarcityTrigger = (type, message, data) => {
    console.log('稀缺度触发:', type, message);
    // 这里可以弹出广告或捐赠提示
  };

  const showNotification = (message, type = 'info') => {
    // 简单的通知实现，可以用更好的 toast 库替换
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const claimReward = (questId) => {
    if (!questSystem) return;
    
    const result = questSystem.claimQuestReward(questId);
    if (result.success) {
      updateStates();
      alert(result.message);
    }
  };

  if (!questsState || !levelState) {
    return <div className="quest-panel loading">加载中...</div>;
  }

  return (
    <div className="quest-panel-overlay" onClick={onClose}>
      <div className="quest-panel" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="quest-panel-header">
          <h2>🎯 任务与成长</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 标签页 */}
        <div className="quest-tabs">
          <button 
            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            📋 每日任务
          </button>
          <button 
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 成就
          </button>
          <button 
            className={`tab-btn ${activeTab === 'levels' ? 'active' : ''}`}
            onClick={() => setActiveTab('levels')}
          >
            ⭐ 等级
          </button>
        </div>

        {/* 内容区 */}
        <div className="quest-content">
          {/* 每日任务 */}
          {activeTab === 'daily' && (
            <div className="daily-quests">
              <div className="quest-info-bar">
                <span>📅 每日任务刷新时间：{getResetTime()}</span>
              </div>
              
              {questsState.daily.map((quest) => (
                <div key={quest.id} className={`quest-card ${quest.completed ? 'completed' : ''} ${quest.claimed ? 'claimed' : ''}`}>
                  <div className="quest-header">
                    <span className="quest-icon">{getQuestIcon(quest.difficulty)}</span>
                    <div className="quest-info">
                      <h4>{quest.title}</h4>
                      <p>{quest.description}</p>
                    </div>
                    {quest.completed && !quest.claimed && (
                      <button 
                        className="claim-btn"
                        onClick={() => claimReward(quest.id)}
                      >
                        💰 领取
                      </button>
                    )}
                    {quest.claimed && (
                      <span className="claimed-badge">✓ 已领取</span>
                    )}
                  </div>
                  
                  <div className="quest-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {quest.progress} / {quest.target}
                    </span>
                  </div>
                  
                  <div className="quest-reward">
                    <span>🎁 奖励:</span>
                    <span className="xp-badge">+{quest.reward.xp} XP</span>
                    <span className="coin-badge">+{quest.reward.coins} 💰</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 成就 */}
          {activeTab === 'achievements' && (
            <div className="achievements-list">
              {questsState.achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                          />
                        </div>
                        <span>{achievement.progress} / {achievement.target}</span>
                      </div>
                    )}
                  </div>
                  
                  {achievement.unlocked && (
                    <div className="achievement-reward">
                      <span className="reward-badge">{achievement.icon}</span>
                      <span>+{achievement.reward.xp} XP</span>
                      {achievement.reward.badge && (
                        <span className="badge-name">{achievement.reward.badge}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 等级信息 */}
          {activeTab === 'levels' && (
            <div className="level-info">
              <div className="level-header">
                <div className="level-display">
                  <span className="level-number">{levelState.level}</span>
                  <span className="level-title">等级</span>
                </div>
                
                <div className="level-stats">
                  <div className="stat-item">
                    <span className="label">经验值</span>
                    <span className="value">{levelState.xp} / {levelState.xpToNextLevel}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">进度</span>
                    <span className="value">{levelState.progress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="xp-progress-bar">
                <div 
                  className="xp-progress-fill"
                  style={{ width: `${levelState.progress}%` }}
                />
              </div>
              
              <div className="level-bonuses">
                <h3>🎁 当前等级加成</h3>
                <div className="bonus-grid">
                  <div className="bonus-card">
                    <span className="bonus-icon">💰</span>
                    <span>最大下注 x{levelState.maxBetMultiplier.toFixed(1)}</span>
                  </div>
                  <div className="bonus-card">
                    <span className="bonus-icon">🎯</span>
                    <span>赢钱奖励 +{(levelState.winBonus * 100).toFixed(0)}%</span>
                  </div>
                  <div className="bonus-card">
                    <span className="bonus-icon">📅</span>
                    <span>每日奖励 +{(levelState.dailyRewardBonus * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="badges-section">
                <h3>🏅 我的勋章</h3>
                <div className="badges-grid">
                  {levelState.badges.map((badge) => (
                    <div key={badge.id} className={`badge-item ${badge.tier}`}>
                      <span className="badge-icon">{badge.icon}</span>
                      <span className="badge-name">{badge.name}</span>
                    </div>
                  ))}
                  {levelState.badges.length === 0 && (
                    <p className="no-badges">继续游戏解锁更多勋章！</p>
                  )}
                </div>
              </div>
              
              <div className="features-section">
                <h3>🔓 已解锁特性</h3>
                <div className="features-grid">
                  {levelState.unlockedFeatures.map((feature, index) => (
                    <div key={index} className="feature-item">
                      ✓ {feature}
                    </div>
                  ))}
                  {levelState.unlockedFeatures.length === 0 && (
                    <p className="no-features">提升等级解锁新特性！</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 辅助函数
function getQuestIcon(difficulty) {
  switch (difficulty) {
    case 'easy': return '🟢';
    case 'medium': return '🟡';
    case 'hard': return '🔴';
    default: return '⚪';
  }
}

function getResetTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default QuestPanel;
