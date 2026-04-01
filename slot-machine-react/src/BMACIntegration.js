/**
 * BMACIntegration.js - Buy Me a Coffee 集成工具
 * 功能：加载 Widget、触发捐赠、传递用户数据、监听事件
 */

class BMACIntegration {
  constructor(config = {}) {
    this.config = {
      widgetId: config.widgetId || 'your_username', // BMAC 用户名
      description: config.description || 'Support me on Buy me a coffee!',
      message: config.message || '',
      color: config.color || '#FFDD00',
      position: config.position || 'Right',
      xMargin: config.xMargin || 18,
      yMargin: config.yMargin || 18,
      ...config
    };
    
    this.loaded = false;
    this.userId = null;
    this.callbacks = {
      onWidgetReady: null,
      onDonationInitiated: null,
      onDonationCompleted: null,
      onDonationFailed: null
    };
    
    this.init();
  }
  
  /**
   * 初始化 BMAC Widget
   */
  init() {
    if (this.loaded) {
      console.log('✅ BMAC Widget 已加载');
      return;
    }
    
    // 等待脚本加载完成
    const checkWidgetLoaded = () => {
      if (window.BMCWidgets && typeof window.BMCWidgets.display === 'function') {
        this.loaded = true;
        console.log('✅ BMAC Widget 加载完成');
        
        if (this.callbacks.onWidgetReady) {
          this.callbacks.onWidgetReady();
        }
        
        return true;
      }
      return false;
    };
    
    // 立即检查
    if (checkWidgetLoaded()) {
      return;
    }
    
    // 轮询检查（最多 5 秒）
    let attempts = 0;
    const maxAttempts = 50; // 5 秒 / 100ms
    
    const interval = setInterval(() => {
      attempts++;
      
      if (checkWidgetLoaded()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('⚠️ BMAC Widget 加载超时，使用备用方案');
        this.loadFallbackScript();
      }
    }, 100);
  }
  
  /**
   * 备用脚本加载方案
   */
  loadFallbackScript() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
    script.async = true;
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-id', this.config.widgetId);
    
    script.onload = () => {
      console.log('✅ BMAC 备用脚本加载成功');
      this.loaded = true;
      
      if (this.callbacks.onWidgetReady) {
        this.callbacks.onWidgetReady();
      }
    };
    
    script.onerror = () => {
      console.error('❌ BMAC 备用脚本加载失败');
      if (this.callbacks.onDonationFailed) {
        this.callbacks.onDonationFailed(new Error('Widget 加载失败'));
      }
    };
    
    document.body.appendChild(script);
  }
  
  /**
   * 设置用户 ID
   */
  setUserId(userId) {
    this.userId = userId;
    console.log(`👤 BMAC 用户 ID 已设置：${userId}`);
  }
  
  /**
   * 触发捐赠弹窗
   */
  display(options = {}) {
    if (!this.loaded) {
      console.warn('⚠️ BMAC Widget 未加载，尝试重新初始化');
      this.init();
      
      // 延迟显示
      setTimeout(() => this.display(options), 500);
      return;
    }
    
    const displayOptions = {
      // 传递用户 ID 用于 Webhook 追踪
      extra: this.userId ? `player_${this.userId}` : 'anonymous',
      user_id: this.userId || 'anonymous',
      ...options
    };
    
    console.log('☕ 触发 BMAC 捐赠弹窗:', displayOptions);
    
    try {
      if (window.BMCWidgets && window.BMCWidgets.display) {
        window.BMCWidgets.display(displayOptions);
        
        if (this.callbacks.onDonationInitiated) {
          this.callbacks.onDonationInitiated(displayOptions);
        }
        
        return true;
      } else {
        throw new Error('BMCWidgets.display 方法不存在');
      }
    } catch (error) {
      console.error('❌ BMAC 弹窗触发失败:', error);
      
      // 降级方案：打开新窗口
      this.openInNewWindow();
      
      if (this.callbacks.onDonationFailed) {
        this.callbacks.onDonationFailed(error);
      }
      
      return false;
    }
  }
  
  /**
   * 降级方案：在新窗口打开
   */
  openInNewWindow() {
    const url = `https://www.buymeacoffee.com/${this.config.widgetId}`;
    window.open(url, '_blank');
    console.log('🔗 降级方案：在新窗口打开 BMAC 页面');
  }
  
  /**
   * 直接跳转到捐赠页面
   */
  redirectToDonate(amount = 5, currency = 'USD') {
    const url = `https://www.buymeacoffee.com/${this.config.widgetId}?amount=${amount}&currency=${currency.toLowerCase()}`;
    window.location.href = url;
  }
  
  /**
   * 隐藏 Widget（右下角浮动按钮）
   */
  hideWidget() {
    const widgetElement = document.querySelector('.bmc-widget');
    if (widgetElement) {
      widgetElement.style.display = 'none';
      console.log('👻 BMAC Widget 已隐藏');
    }
  }
  
  /**
   * 显示 Widget
   */
  showWidget() {
    const widgetElement = document.querySelector('.bmc-widget');
    if (widgetElement) {
      widgetElement.style.display = 'block';
      console.log('👁️ BMAC Widget 已显示');
    }
  }
  
  /**
   * 自定义 Widget 样式
   */
  customizeWidget(styles = {}) {
    const widgetElement = document.querySelector('.bmc-widget');
    if (widgetElement) {
      Object.assign(widgetElement.style, styles);
    }
  }
  
  /**
   * 监听 Webhook 回调（需要后端配合）
   * 注意：BMAC 的 Webhook 是服务端回调，前端只能模拟
   */
  simulateWebhookCallback(data) {
    console.log('📡 模拟 BMAC Webhook 回调:', data);
    
    if (this.callbacks.onDonationCompleted) {
      this.callbacks.onDonationCompleted(data);
    }
  }
  
  /**
   * 设置回调
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = callback;
    }
  }
  
  /**
   * 获取配置信息
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔄 BMAC 配置已更新:', this.config);
  }
  
  /**
   * 销毁
   */
  destroy() {
    this.hideWidget();
    this.callbacks = {};
    this.loaded = false;
  }
}

export default BMACIntegration;
