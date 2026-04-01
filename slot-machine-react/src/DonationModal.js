import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Zap, X, Coins, Gem, Shield, TrendingUp } from 'lucide-react';
import './DonationModal.css';

const DonationModal = ({ isOpen, onClose, onDonateClick }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 分钟倒计时
  const [isHovered, setIsHovered] = useState(false);

  // 倒计时逻辑
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // 重置倒计时
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
    }
  }, [isOpen]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDonateClick = () => {
    if (onDonateClick) {
      onDonateClick('https://afdian.com');
    }
  };

  // 奖励项目数据
  const rewards = [
    {
      icon: Coins,
      title: '100,000 初始金币',
      description: '立刻到账，畅玩无阻',
      color: 'yellow',
      badge: '立刻到账'
    },
    {
      icon: Shield,
      title: '永久破产救济 +50%',
      description: '每次破产补助额度提升',
      color: 'blue',
      badge: '永久特权'
    },
    {
      icon: Gem,
      title: 'VIP 身份标识',
      description: '专属金色边框展示',
      color: 'purple',
      badge: '限定版'
    },
    {
      icon: TrendingUp,
      title: '经验值获取 +20%',
      description: '升级速度大幅提升',
      color: 'green',
      badge: '持续增益'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="donation-modal-overlay">
          <motion.div 
            className="donation-modal-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="donation-modal">
              {/* 顶部装饰条 */}
              <div className="modal-decoration-bar" />

              {/* 关闭按钮 */}
              <button onClick={onClose} className="modal-close-btn">
                <X size={24} />
              </button>

              <div className="modal-content">
                {/* 图标装饰 */}
                <div className="modal-icon-section">
                  <div className="icon-wrapper">
                    <motion.div 
                      className="icon-circle-bg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Coffee className="main-icon" size={48} />
                    </motion.div>
                    <motion.div 
                      className="icon-zap"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      <Zap size={24} />
                    </motion.div>
                  </div>
                </div>

                {/* 文案内容 */}
                <div className="modal-text-section">
                  <h2 className="modal-title">手气暂时断电了？</h2>
                  <p className="modal-description">
                    支持开发者 <span className="highlight-price">$1</span> 买杯咖啡，
                    我们将作为回礼赠送您：
                  </p>
                </div>

                {/* 奖励卡片 */}
                <div className="rewards-grid">
                  {rewards.map((reward, index) => (
                    <motion.div 
                      key={index}
                      className={`reward-card reward-${reward.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="reward-header">
                        <reward.icon className={`reward-icon reward-${reward.color}-icon`} size={24} />
                        {reward.badge && (
                          <span className={`reward-badge badge-${reward.color}`}>
                            {reward.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="reward-title">{reward.title}</h4>
                      <p className="reward-description">{reward.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* 总计区域 */}
                <div className="total-value-section">
                  <div className="total-label">总价值超过</div>
                  <div className="total-amount">$50+ 的游戏内容</div>
                </div>

                {/* 倒计时 */}
                <div className="countdown-section">
                  <Zap size={16} className="countdown-icon" />
                  <span>限时特惠剩余时间：</span>
                  <span className="countdown-timer">{formatTime(timeLeft)}</span>
                </div>

                {/* 核心按钮 */}
                <motion.button
                  className="donate-main-btn"
                  onClick={handleDonateClick}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="btn-shine"
                    animate={{ x: isHovered ? '100%' : '-100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="btn-text">☕ 请喝咖啡并回血</span>
                  <span className="btn-subtext">安全支付 · 即时到账</span>
                </motion.button>

                {/* 次要选项 */}
                <button 
                  className="decline-btn"
                  onClick={onClose}
                >
                  不了，我再等等看
                </button>

                {/* 信任标识 */}
                <div className="trust-badges">
                  <div className="trust-item">
                    <Shield size={14} />
                    <span>安全支付</span>
                  </div>
                  <div className="trust-item">
                    <Coins size={14} />
                    <span>即时到账</span>
                  </div>
                  <div className="trust-item">
                    <Zap size={14} />
                    <span>永久有效</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;
