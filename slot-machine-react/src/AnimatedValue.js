/**
 * AnimatedValue - 数值插值动画工具
 * 实现平滑的数值滚动效果（framer-motion / react-countup 替代方案）
 */

class AnimatedValue {
  constructor(options = {}) {
    this.currentValue = options.initial || 0;
    this.targetValue = options.initial || 0;
    this.duration = options.duration || 500; // 默认 500ms
    this.easing = options.easing || 'easeOut';
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
    
    this.startTime = null;
    this.animationFrame = null;
    this.isAnimating = false;
  }
  
  /**
   * 缓动函数集合
   */
  easings = {
    linear: t => t,
    easeIn: t => t * t * t,
    easeOut: t => 1 - Math.pow(1 - t, 3),
    easeInOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutBack: t => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
  };
  
  /**
   * 设置目标值并开始动画
   */
  setTarget(value) {
    this.targetValue = value;
    this.start();
  }
  
  /**
   * 启动动画
   */
  start() {
    if (this.isAnimating) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.startTime = performance.now();
    this.isAnimating = true;
    this.animate();
  }
  
  /**
   * 动画循环
   */
  animate() {
    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // 应用缓动
    const easedProgress = this.easings[this.easing](progress);
    
    // 插值计算
    this.currentValue = this.currentValue + (this.targetValue - this.currentValue) * easedProgress;
    
    // 回调
    this.onUpdate(this.currentValue);
    
    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    } else {
      this.currentValue = this.targetValue;
      this.onUpdate(this.currentValue);
      this.isAnimating = false;
      this.onComplete();
    }
  }
  
  /**
   * 停止动画
   */
  stop() {
    if (this.isAnimating) {
      cancelAnimationFrame(this.animationFrame);
      this.isAnimating = false;
    }
  }
  
  /**
   * 获取当前值（格式化）
   */
  getValue(decimals = 0) {
    return this.currentValue.toFixed(decimals);
  }
}

export default AnimatedValue;
