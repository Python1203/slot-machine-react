/**
 * BetIntensityControl - 下注力度交互控制器
 * 滑动条 + 长按连发逻辑，使用 requestAnimationFrame 优化性能
 */

class BetIntensityControl {
  constructor(options = {}) {
    this.slider = options.slider;
    this.display = options.display;
    this.onBetChange = options.onBetChange || (() => {});
    this.onAutoSpin = options.onAutoSpin || (() => {});
    
    // 状态
    this.currentBet = options.initialBet || 10;
    this.minBet = options.minBet || 10;
    this.maxBet = options.maxBet || 100;
    this.isPressing = false;
    this.pressStartTime = 0;
    this.autoSpinInterval = null;
    this.animationFrame = null;
    
    // 长按配置
    this.longPressDuration = options.longPressDuration || 500; // 500ms 触发长按
    this.autoSpinSpeed = options.autoSpinSpeed || 200; // 200ms 自动旋转一次
    
    // 绑定方法
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.updateSliderVisuals = this.updateSliderVisuals.bind(this);
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化事件监听
   */
  init() {
    if (this.slider) {
      // 指针事件（支持鼠标和触摸）
      this.slider.addEventListener('pointerdown', this.handlePointerDown);
      this.slider.addEventListener('pointerup', this.handlePointerUp);
      this.slider.addEventListener('pointerleave', this.handlePointerUp);
      this.slider.addEventListener('pointermove', this.handlePointerMove);
      
      // 防止默认行为
      this.slider.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    // 初始渲染
    this.updateDisplay();
  }
  
  /**
   * 指针按下处理
   */
  handlePointerDown(e) {
    e.preventDefault();
    this.isPressing = true;
    this.pressStartTime = Date.now();
    
    // 计算点击位置对应的 bet 值
    const rect = this.slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newBet = Math.round(this.minBet + percentage * (this.maxBet - this.minBet));
    
    this.setBet(newBet);
    
    // 启动动画循环检测长按
    this.detectLongPress();
  }
  
  /**
   * 指针释放处理
   */
  handlePointerUp(e) {
    e.preventDefault();
    this.isPressing = false;
    this.pressStartTime = 0;
    
    // 停止自动旋转
    this.stopAutoSpin();
    
    // 取消动画帧
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  /**
   * 指针移动处理
   */
  handlePointerMove(e) {
    if (!this.isPressing) return;
    
    e.preventDefault();
    
    // 计算滑动位置
    const rect = this.slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newBet = Math.round(this.minBet + percentage * (this.maxBet - this.minBet));
    
    this.setBet(newBet);
  }
  
  /**
   * 检测长按
   */
  detectLongPress() {
    const checkPress = () => {
      if (!this.isPressing) return;
      
      const elapsed = Date.now() - this.pressStartTime;
      
      if (elapsed >= this.longPressDuration) {
        // 触发长按效果
        this.triggerLongPressEffect();
        
        // 开始自动旋转
        this.startAutoSpin();
      } else {
        // 继续检测
        this.animationFrame = requestAnimationFrame(checkPress);
      }
    };
    
    this.animationFrame = requestAnimationFrame(checkPress);
  }
  
  /**
   * 触发长按效果
   */
  triggerLongPressEffect() {
    // 视觉反馈
    this.slider.classList.add('long-press-active');
    
    // 触觉反馈（移动设备）
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    console.log('🎰 长按触发 - 自动旋转启动');
  }
  
  /**
   * 开始自动旋转
   */
  startAutoSpin() {
    this.stopAutoSpin(); // 先停止现有的
    
    this.autoSpinInterval = setInterval(() => {
      if (this.isPressing) {
        this.onAutoSpin();
        
        // 音效反馈（可选）
        this.playAutoSpinSound();
      } else {
        this.stopAutoSpin();
      }
    }, this.autoSpinSpeed);
  }
  
  /**
   * 停止自动旋转
   */
  stopAutoSpin() {
    if (this.autoSpinInterval) {
      clearInterval(this.autoSpinInterval);
      this.autoSpinInterval = null;
    }
    
    this.slider.classList.remove('long-press-active');
  }
  
  /**
   * 播放自动旋转音效
   */
  playAutoSpinSound() {
    // 这里可以添加音效播放逻辑
    // 例如：短促的"滴"声
  }
  
  /**
   * 设置赌注
   */
  setBet(value) {
    const newBet = Math.max(this.minBet, Math.min(this.maxBet, value));
    
    if (newBet !== this.currentBet) {
      this.currentBet = newBet;
      this.updateDisplay();
      this.onBetChange(this.currentBet);
    }
  }
  
  /**
   * 更新显示
   */
  updateDisplay() {
    if (this.display) {
      this.display.textContent = `¥${this.currentBet}`;
    }
    
    this.updateSliderVisuals();
  }
  
  /**
   * 更新滑块视觉效果
   */
  updateSliderVisuals() {
    if (!this.slider) return;
    
    const percentage = ((this.currentBet - this.minBet) / (this.maxBet - this.minBet)) * 100;
    
    // 更新背景渐变
    this.slider.style.background = `linear-gradient(to right, #667eea 0%, #764ba2 ${percentage}%, #ccc ${percentage}%, #ccc 100%)`;
    
    // 添加强度指示
    const intensity = this.getIntensityLevel();
    this.slider.className = `bet-slider intensity-${intensity}`;
  }
  
  /**
   * 获取强度等级
   */
  getIntensityLevel() {
    const percentage = (this.currentBet - this.minBet) / (this.maxBet - this.minBet);
    
    if (percentage >= 0.8) return 'max';
    if (percentage >= 0.6) return 'high';
    if (percentage >= 0.4) return 'medium';
    if (percentage >= 0.2) return 'low';
    return 'min';
  }
  
  /**
   * 销毁
   */
  destroy() {
    if (this.slider) {
      this.slider.removeEventListener('pointerdown', this.handlePointerDown);
      this.slider.removeEventListener('pointerup', this.handlePointerUp);
      this.slider.removeEventListener('pointerleave', this.handlePointerUp);
      this.slider.removeEventListener('pointermove', this.handlePointerMove);
    }
    
    this.stopAutoSpin();
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

export default BetIntensityControl;
