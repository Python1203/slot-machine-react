/**
 * RealTimeMarquee - 实时中奖跑马灯
 * 通过 WebSocket/Pusher 接收全局大奖信息，无感推送到侧边栏
 */

class RealTimeMarquee {
  constructor(options = {}) {
    this.container = options.container;
    this.maxItems = options.maxItems || 10;
    this.animationDuration = options.animationDuration || 300;
    this.displayDuration = options.displayDuration || 5000;
    
    this.items = [];
    this.pusher = null;
    this.channel = null;
    
    // 绑定方法
    this.addWin = this.addWin.bind(this);
    this.removeOldest = this.removeOldest.bind(this);
  }
  
  /**
   * 初始化 Pusher 连接
   */
  initPusher(appKey, cluster) {
    // eslint-disable-next-line no-undef
    if (typeof Pusher !== 'undefined') {
      // eslint-disable-next-line no-undef
      this.pusher = new Pusher(appKey, {
        cluster: cluster,
        encrypted: true
      });
      
      this.channel = this.pusher.subscribe('casino-wins');
      
      this.channel.bind('big-win', (data) => {
        this.addWin(data);
      });
      
      console.log('✅ Pusher 连接成功');
    } else {
      console.warn('⚠️ Pusher 未加载，使用模拟数据');
      this.startSimulation();
    }
  }
  
  /**
   * 添加中奖记录
   */
  addWin(winData) {
    const item = {
      id: Date.now() + Math.random(),
      player: this.anonymizePlayer(winData.player),
      game: winData.game || '老虎机',
      amount: winData.amount,
      timestamp: new Date(),
      type: this.getWinType(winData.amount)
    };
    
    this.items.unshift(item);
    
    // 保持最大数量
    if (this.items.length > this.maxItems) {
      this.items.pop();
    }
    
    // 更新 UI
    this.render();
    
    // 高亮新记录
    this.highlightNewItem();
    
    // 自动移除旧记录
    setTimeout(() => {
      this.removeOldest();
    }, this.displayDuration);
  }
  
  /**
   * 匿名化玩家名称
   */
  anonymizePlayer(name) {
    if (!name) return '匿名用户';
    const parts = name.split('');
    if (parts.length <= 2) return parts[0] + '*';
    return parts[0] + '*'.repeat(parts.length - 2) + parts[parts.length - 1];
  }
  
  /**
   * 根据金额判断中奖类型
   */
  getWinType(amount) {
    if (amount >= 1000) return 'jackpot';
    if (amount >= 500) return 'big';
    if (amount >= 100) return 'medium';
    return 'small';
  }
  
  /**
   * 渲染跑马灯
   */
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="marquee-header">
        🏆 实时中奖榜
      </div>
      <div class="marquee-list">
        ${this.items.map((item, index) => `
          <div class="marquee-item ${item.type} ${index === 0 ? 'new' : ''}" 
               style="animation-delay: ${index * 50}ms">
            <span class="player">${item.player}</span>
            <span class="game">${item.game}</span>
            <span class="amount">¥${item.amount.toLocaleString()}</span>
            <span class="time">${this.formatTime(item.timestamp)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * 格式化时间
   */
  formatTime(date) {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  /**
   * 高亮新添加的项目
   */
  highlightNewItem() {
    const element = document.querySelector('.marquee-item.new');
    if (element) {
      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 2000);
    }
  }
  
  /**
   * 移除最旧的记录
   */
  removeOldest() {
    if (this.items.length > 0) {
      this.items.pop();
      this.render();
    }
  }
  
  /**
   * 模拟数据（用于测试）
   */
  startSimulation() {
    const mockPlayers = ['张***', '李***', '王***', '赵***', '刘***'];
    const mockGames = ['恭喜发财', '赛博朋克', '幸运 777'];
    const mockAmounts = [50, 100, 200, 500, 1000, 2000];
    
    setInterval(() => {
      const randomData = {
        player: mockPlayers[Math.floor(Math.random() * mockPlayers.length)],
        game: mockGames[Math.floor(Math.random() * mockGames.length)],
        amount: mockAmounts[Math.floor(Math.random() * mockAmounts.length)]
      };
      
      this.addWin(randomData);
    }, 8000);
  }
  
  /**
   * 销毁
   */
  destroy() {
    if (this.pusher) {
      this.pusher.disconnect();
    }
  }
}

export default RealTimeMarquee;
