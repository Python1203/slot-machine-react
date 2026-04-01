/**
 * AdSDK.js - 广告 SDK 接口
 * 功能：集成多种广告平台、激励视频、插屏广告
 */

class AdSDK {
  constructor(config = {}) {
    this.config = {
      platform: config.platform || 'google', // 'google', 'unity', 'facebook'
      testMode: config.testMode || true,
      appId: config.appId || '',
      placementIds: config.placementIds || {},
      ...config
    };
    
    this.initialized = false;
    this.callbacks = {
      onAdLoaded: null,
      onAdFailed: null,
      onAdShown: null,
      onAdDismissed: null,
      onRewardEarned: null
    };
    
    this.adQueue = [];
    this.isShowingAd = false;
    
    this.init();
  }
  
  /**
   * 初始化广告 SDK
   */
  async init() {
    if (this.config.testMode) {
      console.log('📺 广告 SDK 初始化（测试模式）');
      this.initialized = true;
      return;
    }
    
    try {
      // 根据平台加载相应的 SDK
      switch (this.config.platform) {
        case 'google':
          await this.loadGoogleAdMob();
          break;
        case 'unity':
          await this.loadUnityAds();
          break;
        case 'facebook':
          await this.loadFacebookAudienceNetwork();
          break;
        default:
          console.warn('⚠️ 未指定广告平台，使用模拟模式');
      }
      
      this.initialized = true;
      console.log('✅ 广告 SDK 初始化完成');
    } catch (error) {
      console.error('❌ 广告 SDK 初始化失败:', error);
      this.initialized = false;
    }
  }
  
  /**
   * 加载 Google AdMob
   */
  async loadGoogleAdMob() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ Google AdMob 加载完成');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Google AdMob 加载失败');
        reject(new Error('Failed to load Google AdMob'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 加载 Unity Ads
   */
  async loadUnityAds() {
    return new Promise((resolve, reject) => {
      window.UnityAds = window.UnityAds || {};
      
      const script = document.createElement('script');
      script.src = 'https://webview.unityads.unity3d.com/web-sdk/4.0.1/unity-ads-web-sdk.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Unity Ads 加载完成');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Unity Ads 加载失败');
        reject(new Error('Failed to load Unity Ads'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 加载 Facebook Audience Network
   */
  async loadFacebookAudienceNetwork() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/facebook-audience-network@latest/fan-sdk.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Facebook Audience Network 加载完成');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Facebook Audience Network 加载失败');
        reject(new Error('Failed to load Facebook Audience Network'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * 显示激励视频广告
   */
  async showRewardedVideo(placement = 'default') {
    if (!this.initialized) {
      console.warn('⚠️ 广告 SDK 未初始化');
      return this.simulateRewardedVideo();
    }
    
    if (this.isShowingAd) {
      console.warn('⚠️ 广告正在显示中');
      return Promise.resolve({ success: false, reason: 'already_showing' });
    }
    
    try {
      this.isShowingAd = true;
      
      if (this.callbacks.onAdShown) {
        this.callbacks.onAdShown();
      }
      
      // 模拟广告显示（实际应调用相应平台的 API）
      await this.simulateAdDisplay();
      
      // 广告观看完成，发放奖励
      const reward = {
        type: 'coins',
        amount: this.calculateReward(placement)
      };
      
      if (this.callbacks.onRewardEarned) {
        this.callbacks.onRewardEarned(reward);
      }
      
      if (this.callbacks.onAdDismissed) {
        this.callbacks.onAdDismissed();
      }
      
      this.isShowingAd = false;
      
      return {
        success: true,
        reward: reward
      };
      
    } catch (error) {
      console.error('❌ 广告显示失败:', error);
      this.isShowingAd = false;
      
      if (this.callbacks.onAdFailed) {
        this.callbacks.onAdFailed(error);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 显示插屏广告
   */
  async showInterstitial(placement = 'default') {
    if (!this.initialized) {
      return this.simulateInterstitial();
    }
    
    if (this.isShowingAd) {
      return Promise.resolve({ success: false, reason: 'already_showing' });
    }
    
    try {
      this.isShowingAd = true;
      
      if (this.callbacks.onAdShown) {
        this.callbacks.onAdShown();
      }
      
      await this.simulateAdDisplay(3000); // 插屏广告通常 3 秒
      
      if (this.callbacks.onAdDismissed) {
        this.callbacks.onAdDismissed();
      }
      
      this.isShowingAd = false;
      
      return { success: true };
      
    } catch (error) {
      this.isShowingAd = false;
      
      if (this.callbacks.onAdFailed) {
        this.callbacks.onAdFailed(error);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 模拟广告显示（用于测试）
   */
  simulateAdDisplay(duration = 5000) {
    return new Promise(resolve => {
      console.log(`📺 广告开始播放（${duration}ms）`);
      
      // 创建全屏广告容器
      const adContainer = document.createElement('div');
      adContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        flex-direction: column;
      `;
      
      adContainer.innerHTML = `
        <div style="color: #ffd700; font-size: 2rem; margin-bottom: 20px;">
          📺 广告加载中...
        </div>
        <div style="color: #fff; font-size: 1rem;">
          倒计时：<span id="ad-timer">${Math.floor(duration / 1000)}</span>秒
        </div>
        <div style="color: #aaa; font-size: 0.8rem; margin-top: 20px;">
          测试模式 - 实际广告将在这里显示
        </div>
      `;
      
      document.body.appendChild(adContainer);
      
      // 倒计时
      let remaining = duration / 1000;
      const timerElement = document.getElementById('ad-timer');
      
      const countdown = setInterval(() => {
        remaining--;
        if (timerElement) {
          timerElement.textContent = remaining;
        }
        
        if (remaining <= 0) {
          clearInterval(countdown);
        }
      }, 1000);
      
      setTimeout(() => {
        document.body.removeChild(adContainer);
        console.log('✅ 广告播放完成');
        resolve();
      }, duration);
    });
  }
  
  /**
   * 模拟激励视频
   */
  async simulateRewardedVideo() {
    console.log('📺 模拟激励视频广告');
    await this.simulateAdDisplay(5000);
    
    const reward = {
      type: 'coins',
      amount: this.calculateReward('video')
    };
    
    if (this.callbacks.onRewardEarned) {
      this.callbacks.onRewardEarned(reward);
    }
    
    return { success: true, reward };
  }
  
  /**
   * 模拟插屏广告
   */
  async simulateInterstitial() {
    console.log('📺 模拟插屏广告');
    await this.simulateAdDisplay(3000);
    return { success: true };
  }
  
  /**
   * 计算奖励金额
   */
  calculateReward(placement) {
    const rewards = {
      video: 300,        // 激励视频：300 金币
      interstitial: 100, // 插屏广告：100 金币
      banner: 10,        // 横幅广告：10 金币/小时
      offerwall: 500     // 积分墙：500 金币起
    };
    
    return rewards[placement] || 100;
  }
  
  /**
   * 预加载广告
   */
  async preloadAd(placement = 'default') {
    if (!this.initialized) return;
    
    console.log(`📥 预加载广告：${placement}`);
    
    // 实际实现会根据平台调用预加载 API
    // 这里只是模拟
    return Promise.resolve();
  }
  
  /**
   * 检查广告是否可用
   */
  isAdAvailable(placement = 'default') {
    return this.initialized && !this.isShowingAd;
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
   * 销毁
   */
  destroy() {
    // 清理资源
    this.callbacks = {};
    this.adQueue = [];
  }
}

export default AdSDK;
