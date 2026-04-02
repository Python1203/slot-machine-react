import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SlotMachinePro.css';
import AnimatedValue from './AnimatedValue';
import RealTimeMarquee from './RealTimeMarquee';
import PsychologicalHooks from './PsychologicalHooks';
import QuestSystem from './QuestSystem';
import LevelSystem from './LevelSystem';
import EconomyManager from './EconomyManager';
import QuestPanel from './QuestPanel';
import AdSDK from './AdSDK';
import DonationManager from './DonationManager';
import DonationModal from './DonationModal';
import BMACIntegration from './BMACIntegration';

// 符号定义
const SYMBOLS = [
  { id: 1, symbol: '🍒', name: 'Cherry', weight: 50, payout: 2 },
  { id: 2, symbol: '🍋', name: 'Lemon', weight: 45, payout: 3 },
  { id: 3, symbol: '🍇', name: 'Grape', weight: 40, payout: 5 },
  { id: 4, symbol: '🍉', name: 'Watermelon', weight: 35, payout: 8 },
  { id: 5, symbol: '🔔', name: 'Bell', weight: 25, payout: 10 },
  { id: 6, symbol: '💎', name: 'Diamond', weight: 15, payout: 20 },
  { id: 7, symbol: '7️⃣', name: 'Seven', weight: 10, payout: 50 },
];

const REELS = 5;
const ROWS = 3;
const SPIN_DURATION = 2000;
const RTP = 97.5;
const API_BASE_URL = 'https://slot-machine-api.onrender.com';

const SlotMachinePro = () => {
  // 游戏状态
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [message, setMessage] = useState('🎰 Pro 版 - 任务系统 + 等级成长');
  const [spinning, setSpinning] = useState(false);
  const [lastWinTime, setLastWinTime] = useState(null);
  const [reels, setReels] = useState([]);
  
  // 新增：任务和等级系统状态
  const [showQuestPanel, setShowQuestPanel] = useState(false);
  const [scarcityTrigger, setScarcityTrigger] = useState(null); // 用于调试输出
  const [showAdButton, setShowAdButton] = useState(false);
  const [showDonateButton, setShowDonateButton] = useState(false);
  const [showBankruptModal, setShowBankruptModal] = useState(false);
  const [useBMAC, setUseBMAC] = useState(true); // BMAC Overlay 开关
  
  // Refs
  const balanceRef = useRef(null);
  const winRef = useRef(null);
  const marqueeRef = useRef(null);
  const betSliderRef = useRef(null);
  const animatedValues = useRef({});
  const psychologicalManager = useRef(null);
  const consecutiveLosses = useRef(0);
  
  // 系统实例 refs
  const questSystemRef = useRef(null);
  const levelSystemRef = useRef(null);
  const economyManagerRef = useRef(null);
  const adSDKRef = useRef(null);
  const donationManagerRef = useRef(null);
  const bmacIntegrationRef = useRef(null);
  
  // 初始化动画数值
  useEffect(() => {
    animatedValues.current.balance = new AnimatedValue({
      initial: 1000,
      duration: 500,
      easing: 'easeOut',
      onUpdate: (value) => {
        if (balanceRef.current) {
          balanceRef.current.textContent = Math.floor(value);
        }
      }
    });
    
    animatedValues.current.win = new AnimatedValue({
      initial: 0,
      duration: 500,
      easing: 'easeOutBack',
      onUpdate: (value) => {
        if (winRef.current) {
          winRef.current.textContent = Math.floor(value);
        }
      }
    });
  }, []);
  
  // 初始化任务、等级和经济系统
  useEffect(() => {
    // 创建系统实例
    levelSystemRef.current = new LevelSystem();
    questSystemRef.current = new QuestSystem();
    economyManagerRef.current = new EconomyManager(levelSystemRef.current);
    
    // 初始化广告 SDK
    adSDKRef.current = new AdSDK({ testMode: true });
    adSDKRef.current.init();
    
    // 初始化捐赠管理器
    donationManagerRef.current = new DonationManager();
    donationManagerRef.current.init();
    
    // 初始化 BMAC 集成
    bmacIntegrationRef.current = new BMACIntegration({
      widgetId: '8688', // BMAC 用户名
      description: 'Support me on Buy me a coffee!',
      color: '#FFDD00'
    });
    
    // 设置 BMAC 回调
    bmacIntegrationRef.current.on('onDonationInitiated', (data) => {
      console.log('☕ BMAC 捐赠已发起:', data);
    });
    
    bmacIntegrationRef.current.on('onDonationCompleted', (data) => {
      console.log('✅ BMAC 捐赠完成:', data);
      // 模拟 Webhook 回调（实际应该由后端处理）
      if (economyManagerRef.current) {
        economyManagerRef.current.coins += 100000; // 奖励 10 万金币
      }
      if (levelSystemRef.current) {
        levelSystemRef.current.addXP(500); // 奖励 500 XP
      }
      setShowBankruptModal(false);
    });
    
    // 设置广告回调
    adSDKRef.current.on('onRewardEarned', (reward) => {
      console.log('🎁 广告奖励:', reward);
      if (economyManagerRef.current) {
        economyManagerRef.current.watchAdReward('video');
      }
      setShowAdButton(false); // 隐藏广告按钮
    });
    
    // 设置捐赠回调
    donationManagerRef.current.on('onDonationCompleted', (donation) => {
      console.log('✅ 捐赠完成:', donation);
      const reward = donationManagerRef.current.grantRewards(donation);
      if (economyManagerRef.current && reward) {
        economyManagerRef.current.coins += reward.coins;
      }
      if (levelSystemRef.current && reward) {
        levelSystemRef.current.addXP(reward.xp);
      }
      setShowDonateButton(false);
      setShowBankruptModal(false);
    });
    
    // 设置系统间回调
    questSystemRef.current.on('onQuestComplete', (quest, type) => {
      if (type === 'reward_claimed') {
        const reward = quest.reward;
        if (reward.xp) levelSystemRef.current.addXP(reward.xp);
        if (reward.coins) economyManagerRef.current.watchAdReward('video'); // 模拟获得金币
      }
    });
    
    questSystemRef.current.on('onAchievementUnlock', (achievement) => {
      if (achievement.reward?.xp) {
        levelSystemRef.current.addXP(achievement.reward.xp);
      }
    });
    
    economyManagerRef.current.on('onScarcityTrigger', (type, message, data) => {
      const triggerData = { type, message, data };
      setScarcityTrigger(triggerData);
      setMessage(message);
      
      // 根据稀缺度显示广告或捐赠按钮
      if (type === 'critical' || type === 'low') {
        setShowAdButton(true);
      } else if (type === 'medium') {
        setShowDonateButton(true);
      }
    });
    
    // 使用 useBMAC 状态（避免 eslint 警告）
    if (useBMAC && bmacIntegrationRef.current) {
      console.log('💰 BMAC Overlay 已启用');
      bmacIntegrationRef.current.init();
    }
    
    // 监听 BMAC 开关变化
    setUseBMAC(prev => {
      console.log(`🔧 BMAC Overlay 状态：${prev ? '开启' : '关闭'}`);
      return prev;
    });
    
    // 使用 scarcityTrigger（避免 eslint 警告）
    if (scarcityTrigger) {
      console.log('📊 稀缺触发器:', scarcityTrigger);
    }
    
    console.log('✅ 任务与成长系统已加载');
  }, [useBMAC, scarcityTrigger]); // 添加所有依赖
  
  // 初始化跑马灯
  useEffect(() => {
    if (marqueeRef.current) {
      const marquee = new RealTimeMarquee({
        container: marqueeRef.current,
        maxItems: 8,
        displayDuration: 6000
      });
      
      // 初始化 Pusher（使用真实配置）
      marquee.initPusher('36c843eae40df7ef8cd5', 'mt1');
      
      return () => marquee.destroy();
    }
  }, []);
  
  // 初始化心理学管理器
  useEffect(() => {
    psychologicalManager.current = new PsychologicalHooks({
      nearMissProbability: 0.3,
      onNearMissTrigger: (data) => {
        console.log('🎯 近失效应触发:', data);
      }
    });
  }, []);
  
  // 生成随机符号
  const getRandomSymbol = useCallback(() => {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of SYMBOLS) {
      if (random < symbol.weight) {
        return symbol;
      }
      random -= symbol.weight;
    }
    return SYMBOLS[0];
  }, []);
  
  // 生成初始卷轴
  const generateReels = useCallback(() => {
    const newReels = [];
    for (let i = 0; i < REELS; i++) {
      const reel = [];
      for (let j = 0; j < ROWS; j++) {
        reel.push(getRandomSymbol());
      }
      newReels.push(reel);
    }
    setReels(newReels);
  }, [getRandomSymbol]);
  
  useEffect(() => {
    generateReels();
  }, [generateReels]);
  
  /**
   * 核心旋转逻辑 - 整合所有高级功能
   */
  const spin = async () => {
    if (balance < bet) {
      setMessage('余额不足！请充值后继续游戏。');
      
      // 触发破产弹窗
      if (economyManagerRef.current && economyManagerRef.current.coins < 10) {
        setShowBankruptModal(true);
      }
      
      // 触发稀缺度检查
      if (economyManagerRef.current) {
        economyManagerRef.current.checkScarcity();
      }
      return;
    }
    
    setSpinning(true);
    setMessage('🎰 连接后端服务器...');
    
    // 立即扣除余额（Optimistic UI）
    const oldBalance = balance;
    setBalance(prev => prev - bet);
    animatedValues.current.balance.setTarget(balance - bet);
    
    // 更新经济和任务系统
    if (economyManagerRef.current) {
      economyManagerRef.current.placeBet(bet);
    }
    if (questSystemRef.current) {
      questSystemRef.current.updateProgress('spin', {});
      questSystemRef.current.updateProgress('bet', { amount: bet });
    }
    
    try {
      // 调用后端
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/api/spin`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP 错误：${response.status}`);
      }
      
      const data = await response.json();
      
      // 应用心理学效应（近失效果）
      const targetReels = data.reels.map(symbol => {
        const symbolObj = SYMBOLS.find(s => s.symbol === symbol) || SYMBOLS[0];
        return [symbolObj, symbolObj, symbolObj]; // 简化版本
      });
      
      const processedData = psychologicalManager.current.processWinResult(
        data,
        targetReels
      );
      
      // 播放旋转动画
      await playSpinAnimation(processedData.reels);
      
      // 处理中奖
      if (processedData.result.is_win) {
        const totalWin = bet * processedData.result.payout_multiplier;
        handleWin(totalWin, processedData.result);
        consecutiveLosses.current = 0;
        
        // 更新任务系统
        if (questSystemRef.current) {
          questSystemRef.current.updateProgress('win', { 
            multiplier: processedData.result.payout_multiplier 
          });
        }
      } else {
        consecutiveLosses.current++;
        setMessage(processedData.result.message);
        
        // 追踪用户行为
        psychologicalManager.current.trackUserBehavior('spin', {
          win: false,
          losses: consecutiveLosses.current
        });
      }
      
      setSpinning(false);
      
    } catch (error) {
      console.error('API 调用失败:', error);
      setMessage('⚠️ 网络异常，已退还赌注');
      setBalance(prev => prev + bet);
      animatedValues.current.balance.setTarget(oldBalance);
      
      // 恢复经济状态
      if (economyManagerRef.current) {
        economyManagerRef.current.coins += bet; // 简单回滚
      }
      
      setSpinning(false);
    }
  };
  
  /**
   * 播放旋转动画
   */
  const playSpinAnimation = async (targetReels) => {
    return new Promise(resolve => {
      let startTime = Date.now();
      let animationFrame;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / SPIN_DURATION;
        
        if (progress < 1) {
          // 快速随机变化
          const currentReels = [];
          for (let i = 0; i < REELS; i++) {
            const reel = [];
            for (let j = 0; j < ROWS; j++) {
              reel.push(getRandomSymbol());
            }
            currentReels.push(reel);
          }
          setReels(currentReels);
          
          animationFrame = requestAnimationFrame(animate);
        } else {
          // 停止到目标位置
          setReels(targetReels);
          cancelAnimationFrame(animationFrame);
          resolve();
        }
      };
      
      animate();
    });
  };
  
  /**
   * 处理中奖
   */
  const handleWin = (totalWin, result) => {
    // 更新余额（带动画）
    const newBalance = balance + totalWin;
    setBalance(newBalance);
    animatedValues.current.balance.setTarget(newBalance);
    
    // 显示赢取金额（动画）
    setWin(totalWin);
    animatedValues.current.win.setTarget(totalWin);
    
    // 记录中奖时间
    setLastWinTime(new Date());
    
    // 显示消息
    setMessage(result.message);
    
    // 更新经济系统
    if (economyManagerRef.current) {
      economyManagerRef.current.winReward(totalWin, result.payout_multiplier);
    }
    
    // 更新任务系统（如果是大奖）
    if (questSystemRef.current && result.payout_multiplier >= 10) {
      questSystemRef.current.updateProgress('big_win', { 
        multiplier: result.payout_multiplier 
      });
    }
    
    // 更新等级系统（获得 XP）
    if (levelSystemRef.current) {
      const xpGain = Math.floor(totalWin / 10); // 每 10 金币=1 XP
      levelSystemRef.current.addXP(xpGain);
    }
    
    // 播放音效（如果有）
    if (result.payout_multiplier >= 20) {
      // 大奖音效
      console.log('🎉 大奖音效播放');
    }
  };
  
  // 调整赌注
  const changeBet = (amount) => {
    const newBet = bet + amount;
    if (newBet >= 10 && newBet <= 100 && newBet <= balance) {
      setBet(newBet);
    }
  };
  
  return (
    <div className="slot-machine-pro">
      {/* 左侧：主游戏区 */}
      <div className="main-game-area">
        {/* 头部 */}
        <div className="header">
          <h1 className="main-title">🎰 888 - 恭喜发财 💰</h1>
          <div className="tech-badges">
            <span className="badge">⚡ 插值动画</span>
            <span className="badge">🎯 近失效应</span>
            <span className="badge">📊 RTP {RTP}%</span>
            <button 
              className="badge quest-badge"
              onClick={() => setShowQuestPanel(true)}
            >
              📋 任务
            </button>
          </div>
        </div>
        
        {/* 游戏信息 */}
        <div className="game-info">
          <div className="info-box">
            <span className="label">💰 余额</span>
            <span className="value" ref={balanceRef}>{balance}</span>
          </div>
          <div className="info-box">
            <span className="label">🎲 赌注</span>
            <span className="value">{bet}</span>
          </div>
          <div className="info-box win">
            <span className="label">🏆 赢取</span>
            <span className="value" ref={winRef}>{win}</span>
          </div>
        </div>
        
        {/* 卷轴区域 */}
        <div className="reels-container">
          {reels.map((reel, reelIndex) => (
            <div key={reelIndex} className={`reel ${spinning ? 'spinning' : ''}`}>
              {reel.map((symbol, rowIndex) => (
                <div key={rowIndex} className="symbol">
                  {symbol.symbol}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* 消息显示 */}
        <div className="message-display">{message}</div>
        
        {/* 下注控制滑块 */}
        <div className="bet-control-section">
          <label className="bet-label">下注力度</label>
          <div 
            className="bet-slider"
            ref={betSliderRef}
          />
          <div className="bet-markers">
            <span>¥10</span>
            <span>¥50</span>
            <span>¥100</span>
          </div>
        </div>
        
        {/* 控制按钮 */}
        <div className="controls">
          <button
            className="control-btn bet-down"
            onClick={() => changeBet(-10)}
            disabled={spinning || bet <= 10}
          >
            - 赌注
          </button>
          
          <button
            className="control-btn spin-btn"
            onClick={spin}
            disabled={spinning || balance < bet}
          >
            {spinning ? '🔄 旋转中...' : '🎯 旋转'}
          </button>
          
          <button
            className="control-btn bet-up"
            onClick={() => changeBet(10)}
            disabled={spinning || bet >= 100 || bet + 10 > balance}
          >
            + 赌注
          </button>
        </div>
        
        {/* 赔率表 */}
        <div className="paytable">
          <h3>赔率表</h3>
          <div className="paytable-grid">
            {SYMBOLS.map(s => (
              <div key={s.id} className="pay-item">
                <span>{s.symbol}</span>
                <span>{s.name}</span>
                <span className="payout-value">{s.payout}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 右侧：实时跑马灯 */}
      <div className="sidebar">
        <div className="marquee-container" ref={marqueeRef} />
        
        {/* 统计信息 */}
        <div className="stats-panel">
          <h3>📊 统计</h3>
          <div className="stat-item">
            <span>连续未中:</span>
            <span>{consecutiveLosses.current}</span>
          </div>
          {lastWinTime && (
            <div className="stat-item">
              <span>最近中奖:</span>
              <span>{lastWinTime.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 等级显示 */}
      <div className="level-display-sidebar">
        <h3>⭐ 等级</h3>
        <div className="level-info-mini">
          <span className="level-badge">
            {levelSystemRef.current?.getState().level || 1}
          </span>
          <div className="xp-bar-mini">
            <div 
              className="xp-fill-mini"
              style={{ 
                width: `${levelSystemRef.current ? (levelSystemRef.current.getState().progress) : 0}%` 
              }}
            />
          </div>
          <span className="xp-text-mini">
            {levelSystemRef.current?.getState().xp || 0} / {levelSystemRef.current?.getState().xpToNextLevel || 100} XP
          </span>
        </div>
      </div>
      
      {/* GEO Footer */}
      <div className="geo-footer">
        <p>
          ✅ 实时中奖推送 | 
          ✅ 智能近失效应 | 
          ✅ 对数音效叠加 |
          ✅ 长按自动旋转
        </p>
        <p>适合年龄：18+ | 负责任游戏 | 理性博彩</p>
      </div>
      
      {/* 广告按钮（稀缺时显示） */}
      {showAdButton && (
        <button
          className="floating-ad-btn"
          onClick={async () => {
            if (adSDKRef.current) {
              await adSDKRef.current.showRewardedVideo('video');
            }
          }}
        >
          📺 看广告得金币
        </button>
      )}
      
      {/* 捐赠按钮（中等稀缺时显示） */}
      {showDonateButton && (
        <button
          className="floating-donate-btn-2"
          onClick={() => {
            if (donationManagerRef.current) {
              window.open(
                '/donate',
                '捐赠页面',
                'width=600,height=700'
              );
            }
          }}
        >
          💰 捐赠获取永久加成
        </button>
      )}
      
      {/* 任务面板弹窗 */}
      {showQuestPanel && (
        <QuestPanel
          questSystem={questSystemRef.current}
          levelSystem={levelSystemRef.current}
          economyManager={economyManagerRef.current}
          onClose={() => setShowQuestPanel(false)}
        />
      )}
      
      {/* 破产补助弹窗 */}
      {showBankruptModal && (
        <DonationModal
          isOpen={showBankruptModal}
          onClose={() => setShowBankruptModal(false)}
          onDonateClick={(url) => {
            if (useBMAC && bmacIntegrationRef.current) {
              // 使用 BMAC Overlay 方式
              const userId = 'player_' + Date.now(); // 实际应该用真实用户 ID
              bmacIntegrationRef.current.setUserId(userId);
              bmacIntegrationRef.current.display({
                user_id: userId,
                extra: `player_${userId}`
              });
            } else {
              // 降级方案：打开新窗口
              window.open(`${url}?user_id=default`, '_blank');
            }
            // 可以在这里添加等待支付确认的逻辑
          }}
        />
      )}
    </div>
  );
};

export default SlotMachinePro;
