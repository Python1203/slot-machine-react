/**
 * Canvas Reel Renderer - 高性能卷轴渲染器
 * 使用 Canvas API 实现流畅的 60fps 动画
 * 支持无限滚动、缓动曲线和物理反馈
 */

class CanvasReelRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 配置参数
    this.symbolHeight = options.symbolHeight || 100;
    this.rows = options.rows || 3;
    this.symbols = options.symbols || [];
    
    // 状态管理
    this.offsetY = 0;           // 当前偏移量
    this.targetOffsetY = 0;     // 目标偏移量
    this.isSpinning = false;
    this.velocity = 0;          // 当前速度
    this.acceleration = 0;      // 加速度
    
    // 缓动函数（Back-Out 效果）
    this.easingFunctions = {
      easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      },
      easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
      easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    };
    
    // 纹理缓存（优化性能）
    this.textureCache = new Map();
    
    // 绑定方法
    this.render = this.render.bind(this);
    this.spin = this.spin.bind(this);
    this.stop = this.stop.bind(this);
  }
  
  /**
   * 预加载符号纹理到缓存
   */
  preloadTextures() {
    this.symbols.forEach(symbol => {
      if (!this.textureCache.has(symbol.symbol)) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.symbolHeight;
        const ctx = canvas.getContext('2d');
        
        // 绘制符号背景
        this.drawSymbolBackground(ctx, 0, 0, this.width, this.symbolHeight, symbol);
        
        // 绘制符号本身
        this.drawSymbolEmoji(ctx, symbol.symbol, this.width / 2, this.symbolHeight / 2);
        
        this.textureCache.set(symbol.symbol, canvas);
      }
    });
  }
  
  /**
   * 绘制符号背景（带渐变和光泽）
   */
  drawSymbolBackground(ctx, x, y, width, height, symbol) {
    // 创建渐变
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    
    // 根据稀有度设置颜色
    const rarityColors = {
      1: ['#ff6b6b', '#ee5a6f'],  // Cherry
      2: ['#ffd93d', '#f9c846'],  // Lemon
      3: ['#6bcb77', '#5ab966'],  // Grape
      4: ['#4ecdc4', '#3dbdb5'],  // Watermelon
      5: ['#a8e6cf', '#88d6b0'],  // Bell
      6: ['#3498db', '#2980b9'],  // Diamond
      7: ['#9b59b6', '#8e44ad']   // Seven
    };
    
    const colors = rarityColors[symbol.id] || ['#cccccc', '#aaaaaa'];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // 添加金属光泽效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x, y, width, height * 0.1);
    
    // 边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }
  
  /**
   * 绘制 Emoji 符号
   */
  drawSymbolEmoji(ctx, emoji, x, y) {
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    
    // 添加阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(emoji, x, y);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  /**
   * 开始旋转（Optimistic UI - 立即响应）
   */
  spin(duration = 2000) {
    this.isSpinning = true;
    this.startTime = performance.now();
    this.duration = duration;
    
    // 初始加速
    this.velocity = 50;
    this.acceleration = 2;
    
    this.animate();
  }
  
  /**
   * 停止到指定位置（结果对齐）
   */
  stop(targetSymbols = []) {
    this.isSpinning = false;
    
    // 计算目标位置
    const symbolIndex = this.symbols.findIndex(s => 
      s.symbol === targetSymbols[0]?.symbol
    );
    
    if (symbolIndex !== -1) {
      this.targetOffsetY = symbolIndex * this.symbolHeight;
    }
    
    // 应用缓动动画
    this.applyEasingAnimation();
  }
  
  /**
   * 应用缓动动画（Back-Out 效果）
   */
  applyEasingAnimation() {
    const startPosition = this.offsetY;
    const change = this.targetOffsetY - startPosition;
    const duration = 800; // 800ms 完成过渡
    const startTime = performance.now();
    
    const animateStop = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 Back-Out 缓动
      const easedProgress = this.easingFunctions.easeOutBack(progress);
      
      this.offsetY = startPosition + change * easedProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animateStop);
      } else {
        this.offsetY = this.targetOffsetY;
        this.velocity = 0;
      }
      
      this.render();
    };
    
    requestAnimationFrame(animateStop);
  }
  
  /**
   * 主动画循环
   */
  animate(currentTime = 0) {
    if (!this.isSpinning && this.velocity <= 0.1) {
      return;
    }
    
    // 更新物理状态
    if (this.isSpinning) {
      this.velocity += this.acceleration;
      this.offsetY += this.velocity;
      
      // 无限滚动逻辑
      const totalHeight = this.symbols.length * this.symbolHeight;
      if (this.offsetY >= totalHeight) {
        this.offsetY = 0;
      }
    } else {
      // 减速
      this.velocity *= 0.95;
      this.offsetY += this.velocity;
    }
    
    this.render();
    
    if (this.isSpinning || this.velocity > 0.1) {
      requestAnimationFrame((time) => this.animate(time));
    }
  }
  
  /**
   * 渲染帧
   */
  render() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 保存上下文
    this.ctx.save();
    
    // 应用偏移
    this.ctx.translate(0, -this.offsetY);
    
    // 绘制可见区域的符号（优化：只绘制可见部分）
    const visibleStart = Math.floor(this.offsetY / this.symbolHeight);
    const visibleEnd = visibleStart + this.rows + 1;
    
    for (let i = visibleStart; i < visibleEnd && i < this.symbols.length; i++) {
      const symbol = this.symbols[i % this.symbols.length];
      const y = (i % this.symbols.length) * this.symbolHeight;
      
      const texture = this.textureCache.get(symbol.symbol);
      if (texture) {
        this.ctx.drawImage(texture, 0, y);
      } else {
        // 如果缓存未命中，直接绘制
        this.drawSymbolBackground(this.ctx, 0, y, this.width, this.symbolHeight, symbol);
        this.drawSymbolEmoji(this.ctx, symbol.symbol, this.width / 2, y + this.symbolHeight / 2);
      }
    }
    
    // 恢复上下文
    this.ctx.restore();
    
    // 绘制边框和遮罩
    this.drawOverlays();
  }
  
  /**
   * 绘制叠加层（边框、遮罩等）
   */
  drawOverlays() {
    // 顶部遮罩（渐变透明）
    const topGradient = this.ctx.createLinearGradient(0, 0, 0, 50);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = topGradient;
    this.ctx.fillRect(0, 0, this.width, 50);
    
    // 底部遮罩
    const bottomGradient = this.ctx.createLinearGradient(0, this.height - 50, 0, this.height);
    bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    this.ctx.fillStyle = bottomGradient;
    this.ctx.fillRect(0, this.height - 50, this.width, 50);
    
    // 中奖线指示器
    const middleLine = this.rows * this.symbolHeight / 2;
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, middleLine);
    this.ctx.lineTo(this.width, middleLine);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
}

export default CanvasReelRenderer;
