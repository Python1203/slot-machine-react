import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SlotMachineAdvanced.css';
import CanvasReelRenderer from './CanvasReelRenderer';
import OptimisticUIManager from './OptimisticUIManager';

// 符号定义（带权重和赔率）
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

const SlotMachineAdvanced = () => {
  // 游戏状态
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [win, setWin] = useState(0);
  const [message, setMessage] = useState('🎰 专业版 - Canvas 渲染 + Optimistic UI');
  const [spinning, setSpinning] = useState(false);
  const [lastWinTime, setLastWinTime] = useState(null);
  
  // Refs
  const canvasRefs = useRef([]);
  const reelRenderers = useRef([]);
  const optimisticManager = useRef(null);
  
  // 初始化 Optimistic UI Manager
  useEffect(() => {
    optimisticManager.current = new OptimisticUIManager({
      maxRetries: 3,
      timeout: 10000,
      onSuccess: (result) => {
        console.log('✅ 服务器确认:', result);
      },
      onFailure: (error) => {
        console.error('❌ 请求失败:', error);
        setMessage('⚠️ 网络异常，已退还赌注');
      }
    });
  }, []);
  
  // 初始化 Canvas 渲染器
  useEffect(() => {
    if (canvasRefs.current.length === REELS) {
      reelRenderers.current = canvasRefs.current.map((canvas, index) => {
        const renderer = new CanvasReelRenderer(canvas, {
          symbolHeight: 100,
          rows: ROWS,
          symbols: SYMBOLS
        });
        
        renderer.preloadTextures();
        return renderer;
      });
    }
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
  
  /**
   * 核心旋转逻辑 - Optimistic UI 实现
   */
  const spin = async () => {
    if (balance < bet) {
      setMessage('余额不足！请充值后继续游戏。');
      return;
    }
    
    const actionId = `spin_${Date.now()}`;
    
    // 定义乐观更新
    const optimisticUpdate = () => {
      // 1. 立即扣除余额（不等待服务器）
      setBalance(prev => prev - bet);
      
      // 2. 立即开始动画（零延迟）
      setSpinning(true);
      setWin(0);
      setMessage('🎰 卷轴启动...');
      
      // 3. Canvas 渲染器立即开始旋转
      reelRenderers.current.forEach((renderer, index) => {
        setTimeout(() => {
          renderer.spin(SPIN_DURATION);
        }, index * 100); // 错开启动时间
      });
    };
    
    // 定义服务器请求
    const serverRequest = async (signal) => {
      const response = await fetch(`${API_BASE_URL}/api/spin`, {
        method: 'GET',
        signal,
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    };
    
    // 定义回滚操作
    const rollback = (error) => {
      // 退还赌注
      setBalance(prev => prev + bet);
      setSpinning(false);
      
      // 停止所有卷轴
      reelRenderers.current.forEach(renderer => {
        renderer.stop([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      });
    };
    
    // 执行乐观更新
    const result = await optimisticManager.current.execute(
      actionId,
      optimisticUpdate,
      serverRequest,
      rollback
    );
    
    if (result.success) {
      // 服务器返回成功结果
      const data = result.result;
      
      // 等待动画完成后停止
      setTimeout(() => {
        stopReelsWithResult(data.reels);
        
        if (data.is_win) {
          const totalWin = bet * data.payout_multiplier;
          setWin(totalWin);
          setBalance(prev => prev + totalWin);
          setLastWinTime(new Date());
          
          showWinEffect(data.payout_multiplier, totalWin);
          setMessage(data.message);
        } else {
          setMessage(data.message);
        }
        
        setSpinning(false);
      }, SPIN_DURATION);
    }
  };
  
  /**
   * 停止卷轴到指定位置（带缓动效果）
   */
  const stopReelsWithResult = (targetSymbols) => {
    reelRenderers.current.forEach((renderer, index) => {
      setTimeout(() => {
        // 为每个卷轴计算目标位置
        const targetSymbol = targetSymbols[index % targetSymbols.length];
        const symbolIndex = SYMBOLS.findIndex(s => s.symbol === targetSymbol);
        
        // 停止时应用 Back-Out 缓动曲线
        renderer.stop([{ symbol: targetSymbol }]);
      }, index * 150); // 依次停止，增加真实感
    });
  };
  
  /**
   * 显示中奖效果
   */
  const showWinEffect = (multiplier, amount) => {
    const isBigWin = multiplier >= 20;
    
    if (isBigWin) {
      // 大奖特效
      createParticles();
      playWinSound();
    }
    
    // 震动反馈（移动设备）
    if (navigator.vibrate) {
      navigator.vibrate(isBigWin ? [200, 100, 200] : 100);
    }
  };
  
  /**
   * 创建粒子效果
   */
  const createParticles = () => {
    // 这里可以添加粒子系统
    console.log('🎉 大奖触发！粒子效果启动');
  };
  
  /**
   * 播放中奖音效
   */
  const playWinSound = () => {
    // 这里可以添加音频播放
    console.log('🔊 播放中奖音效');
  };
  
  // 调整赌注
  const changeBet = (amount) => {
    const newBet = bet + amount;
    if (newBet >= 10 && newBet <= 100 && newBet <= balance) {
      setBet(newBet);
    }
  };
  
  return (
    <div className="slot-machine-advanced">
      {/* 头部 */}
      <div className="header">
        <h1 className="main-title">🎰 888 - 恭喜发财 💰</h1>
        <div className="tech-badge">
          ⚡ Canvas 渲染 | 🚀 Optimistic UI | 📊 RTP {RTP}%
        </div>
      </div>
      
      {/* 游戏信息 */}
      <div className="game-info">
        <div className="info-box">
          <span className="label">💰 余额</span>
          <span className="value">{balance}</span>
        </div>
        <div className="info-box">
          <span className="label">🎲 赌注</span>
          <span className="value">{bet}</span>
        </div>
        <div className="info-box win">
          <span className="label">🏆 赢取</span>
          <span className="value">{win}</span>
        </div>
      </div>
      
      {/* Canvas 卷轴区域 */}
      <div className="reels-container-canvas">
        {Array.from({ length: REELS }).map((_, index) => (
          <div key={index} className="reel-wrapper">
            <canvas
              ref={el => canvasRefs.current[index] = el}
              width={100}
              height={ROWS * 100}
              className={`reel-canvas ${spinning ? 'spinning' : ''}`}
            />
          </div>
        ))}
      </div>
      
      {/* 消息显示 */}
      <div className="message-display">{message}</div>
      
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
      
      {/* GEO 优化 Footer */}
      <div className="geo-footer">
        <p>
          ✅ 60fps Canvas 渲染 | 
          ✅ Optimistic UI 零卡顿 | 
          ✅ 后端验证公平性
        </p>
        <p>
          适合年龄：18+ | 
          平台：Web/Mobile | 
          技术：React + Canvas
        </p>
        {lastWinTime && (
          <p className="last-win-time">
            🕐 最近中奖：{lastWinTime.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default SlotMachineAdvanced;
