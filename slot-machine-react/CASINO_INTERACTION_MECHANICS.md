# Casino 核心交互机制 - 技术实现文档

## 📋 概述

本文档详细说明 Casino 游戏的核心交互机制，包括 Optimistic UI、Canvas 渲染和物理反馈系统。

### 核心原则

> **结论前置**：Casino 游戏绝不能让用户感觉到"卡顿"。所有交互必须在 100ms 内给出视觉反馈，即使网络有延迟。

**金句**：
> "在 Casino 世界，0.1 秒的延迟就是生与死的距离"

---

## 🎯 一、Optimistic UI（乐观更新）

### 1.1 什么是 Optimistic UI？

Optimistic UI 是一种设计模式：**先假设请求会成功，立即更新 UI，然后再发送请求到服务器**。

#### 传统方式 vs Optimistic UI

```javascript
// ❌ 传统方式：等待服务器响应后才更新 UI
async function spin() {
  setLoading(true);
  const result = await fetch('/api/spin'); // 用户等待 200-500ms
  updateUI(result); // 用户看到变化
}

// ✅ Optimistic UI：立即更新 UI，同时发送请求
async function spin() {
  updateUIImmediately(); // 0ms - 用户立即看到动画
  const result = fetch('/api/spin'); // 异步发送
  
  try {
    await result; // 200ms 后成功
    confirmUI();
  } catch {
    rollbackUI(); // 失败则回滚
  }
}
```

### 1.2 实现代码（OptimisticUIManager.js）

```javascript
class OptimisticUIManager {
  async execute(actionId, optimisticUpdate, serverRequest, rollback) {
    // 1. 立即执行 UI 更新（Optimistic）
    optimisticUpdate();
    
    // 2. 记录待处理动作
    this.pendingActions.set(actionId, {
      status: 'pending',
      timestamp: Date.now()
    });
    
    try {
      // 3. 发起服务器请求（带超时控制）
      const result = await serverRequest(controller.signal);
      
      // 4. 成功：更新状态
      this.onSuccess(result);
      return { success: true, result };
      
    } catch (error) {
      // 5. 失败：重试或回滚
      if (action.attempts < this.maxRetries) {
        return this.retry(actionId, ...); // 重试
      } else {
        rollback(error); // 达到最大重试，回滚
        this.onFailure(error);
      }
    }
  }
}
```

### 1.3 实际应用场景

#### Spin 旋转流程

```javascript
const spin = async () => {
  const actionId = `spin_${Date.now()}`;
  
  // 乐观更新：立即执行
  const optimisticUpdate = () => {
    setBalance(prev => prev - bet); // 立即扣钱
    setSpinning(true);              // 立即开始动画
    setMessage('🎰 卷轴启动...');
    
    // Canvas 渲染器立即开始旋转
    reelRenderers.current.forEach(renderer => {
      renderer.spin(SPIN_DURATION);
    });
  };
  
  // 服务器请求
  const serverRequest = async (signal) => {
    const response = await fetch(`${API_BASE_URL}/api/spin`, { signal });
    return response.json();
  };
  
  // 回滚操作（失败时）
  const rollback = (error) => {
    setBalance(prev => prev + bet); // 退还赌注
    setSpinning(false);
    setMessage('⚠️ 网络异常，已退还赌注');
  };
  
  // 执行
  await optimisticManager.current.execute(
    actionId,
    optimisticUpdate,
    serverRequest,
    rollback
  );
};
```

### 1.4 错误处理策略

| 错误类型 | 处理方式 | 用户体验 |
|---------|---------|---------|
| 网络超时 | 自动重试 3 次 | "正在重新连接..." |
| 服务器错误 | 退还赌注 + 提示 | "网络异常，已退款" |
| 数据校验失败 | 回滚 UI + 详细错误 | "余额不足，请充值" |

---

## 🎨 二、Canvas/WebGL 渲染

### 2.1 为什么不用 DOM？

DOM 节点在高频动画场景下性能极差：

```
❌ DOM 方案（每个符号一个 div）
- 5 卷轴 × 3 行 = 15 个 div
- 每次旋转需要更新 15 个节点的 CSS
- 浏览器重排重绘压力大
- FPS: 30-40（卡顿感明显）

✅ Canvas 方案
- 整个卷轴一个 canvas
- 使用 drawImage 批量绘制
- GPU 加速
- FPS: 60（丝滑流畅）
```

### 2.2 CanvasReelRenderer 核心架构

```javascript
class CanvasReelRenderer {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // 配置
    this.symbolHeight = 100;
    this.rows = 3;
    this.symbols = SYMBOLS;
    
    // 物理状态
    this.offsetY = 0;         // 当前偏移
    this.velocity = 0;        // 速度
    this.acceleration = 0;    // 加速度
  }
  
  // 纹理预加载（性能优化）
  preloadTextures() {
    this.symbols.forEach(symbol => {
      const texture = this.createTexture(symbol);
      this.textureCache.set(symbol.symbol, texture);
    });
  }
  
  // 旋转（立即响应）
  spin(duration = 2000) {
    this.isSpinning = true;
    this.velocity = 50;
    this.acceleration = 2;
    this.animate();
  }
  
  // 停止（带缓动效果）
  stop(targetSymbols) {
    this.isSpinning = false;
    this.applyEasingAnimation(); // Back-Out 缓动
  }
  
  // 主动画循环
  animate() {
    if (!this.isSpinning && this.velocity <= 0.1) return;
    
    // 更新物理状态
    this.velocity += this.acceleration;
    this.offsetY += this.velocity;
    
    // 无限滚动逻辑
    const totalHeight = this.symbols.length * this.symbolHeight;
    if (this.offsetY >= totalHeight) {
      this.offsetY = 0;
    }
    
    this.render();
    requestAnimationFrame(() => this.animate());
  }
  
  // 渲染
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 只绘制可见区域（性能优化）
    const visibleStart = Math.floor(this.offsetY / this.symbolHeight);
    const visibleEnd = visibleStart + this.rows + 1;
    
    for (let i = visibleStart; i < visibleEnd; i++) {
      const symbol = this.symbols[i % this.symbols.length];
      const y = i * this.symbolHeight;
      
      const texture = this.textureCache.get(symbol.symbol);
      if (texture) {
        this.ctx.drawImage(texture, 0, y);
      }
    }
    
    this.drawOverlays(); // 边框、遮罩
  }
}
```

### 2.3 无限滚动算法

核心思想：**通过改变 texture.offset 实现循环滚动的视觉假象**。

```javascript
// 伪代码示例
render() {
  // 计算当前应该显示哪个符号
  const index = Math.floor(this.offsetY / this.symbolHeight);
  
  // 如果超出范围，重置到开头
  if (index >= this.symbols.length) {
    this.offsetY = 0;
  }
  
  // 绘制时使用取模运算
  for (let i = 0; i < this.rows; i++) {
    const symbolIndex = (index + i) % this.symbols.length;
    const symbol = this.symbols[symbolIndex];
    const y = i * this.symbolHeight;
    
    this.ctx.drawImage(texture, 0, y);
  }
}
```

---

## 🎭 三、缓动曲线（Easing Functions）

### 3.1 为什么需要缓动？

现实世界的物体不会突然停止，而是有惯性、回弹等物理特性。

```
❌ 线性停止（不自然）
offset = start + change * progress

✅ 缓动停止（真实感）
offset = start + change * easeOutBack(progress)
```

### 3.2 Back-Out 缓动函数

```javascript
easingFunctions: {
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}
```

**效果说明**：
- 当 t=0.9 时，值可能已经是 1.05（超过目标）
- 当 t=1.0 时，值回弹到 1.0（最终位置）
- 模拟了"冲过头再回来"的物理效果

### 3.3 应用示例

```javascript
applyEasingAnimation() {
  const startPosition = this.offsetY;
  const change = this.targetOffsetY - startPosition;
  const duration = 800; // 800ms
  const startTime = performance.now();
  
  const animateStop = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用 Back-Out 缓动
    const easedProgress = this.easingFunctions.easeOutBack(progress);
    
    this.offsetY = startPosition + change * easedProgress;
    
    if (progress < 1) {
      requestAnimationFrame(animateStop);
    }
  };
  
  requestAnimationFrame(animateStop);
}
```

---

## 🔄 四、结果对齐机制

### 4.1 时序控制

```
时间轴：
0ms     - 用户点击 Spin
0ms     - Optimistic UI 立即启动动画（零延迟）
100ms   - 发送 API 请求到服务器
300ms   - 服务器返回结果
2000ms  - 动画结束，卷轴停止到指定位置
```

### 4.2 停止位置计算

```javascript
stopReelsWithResult(targetSymbols) {
  reelRenderers.current.forEach((renderer, index) => {
    setTimeout(() => {
      // 找到目标符号在数组中的索引
      const symbolIndex = SYMBOLS.findIndex(
        s => s.symbol === targetSymbols[index]
      );
      
      // 计算目标偏移量
      const targetOffsetY = symbolIndex * this.symbolHeight;
      
      // 应用缓动动画停止
      renderer.stopAt(targetOffsetY);
    }, index * 150); // 错开停止时间
  });
}
```

### 4.3 失败处理

```javascript
try {
  const result = await fetch('/api/spin');
  // 成功：按结果停止
  stopReelsWithResult(result.reels);
} catch (error) {
  // 失败：随机停止 + 退款
  const randomSymbols = [getRandom(), getRandom(), getRandom()];
  stopReelsWithResult(randomSymbols);
  refundBet();
  showMessage('网络异常，已退款');
}
```

---

## 📊 五、性能优化技巧

### 5.1 纹理预加载

```javascript
// 游戏开始前预加载所有纹理
preloadTextures() {
  this.symbols.forEach(symbol => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 绘制并缓存
    this.drawSymbol(ctx, symbol);
    this.textureCache.set(symbol.symbol, canvas);
  });
}
```

### 5.2 可见区域裁剪

```javascript
// 只绘制屏幕上看得见的部分
render() {
  const visibleStart = Math.floor(this.offsetY / this.symbolHeight);
  const visibleEnd = visibleStart + this.rows + 1;
  
  for (let i = visibleStart; i < visibleEnd; i++) {
    // 只绘制可见的符号
  }
}
```

### 5.3 RequestAnimationFrame

```javascript
// 使用 RAF 而非 setInterval
animate(currentTime) {
  // 更新逻辑
  this.render();
  
  if (this.isSpinning) {
    requestAnimationFrame((time) => this.animate(time));
  }
}
```

---

## 🎯 六、关键指标

### 6.1 性能指标

| 指标 | 目标值 | 测量方法 |
|-----|-------|---------|
| FPS | 60 | Chrome DevTools |
| 输入延迟 | <100ms | Performance API |
| 动画帧率稳定性 | >95% | RAF timing |
| 内存占用 | <50MB | Memory Profiler |

### 6.2 用户体验指标

| 场景 | 传统方式 | Optimistic UI |
|-----|---------|--------------|
| 点击到动画开始 | 200-500ms | 0ms |
| 网络延迟感知 | 明显 | 无感知 |
| 失败恢复 | 用户困惑 | 自动退款 |

---

## 💡 七、最佳实践总结

### 7.1 DO's（应该做的）

✅ 使用 Canvas 而非 DOM 进行高频动画  
✅ 立即响应用户操作（Optimistic UI）  
✅ 使用缓动曲线增加真实感  
✅ 添加物理反馈（震动、音效）  
✅ 失败时自动回滚并通知用户  

### 7.2 DON'Ts（不应该做的）

❌ 等待服务器响应后才更新 UI  
❌ 使用 setInterval 做动画  
❌ 线性停止（缺乏物理感）  
❌ 失败时不退款或不提示  
❌ 在动画过程中阻塞用户交互  

---

## 📚 参考资料

1. **[Optimistic UI Patterns](https://uxdesign.cc/optimistic-ui-patterns-better-user-experience-for-web-applications-2a9f11713c9b)** - UX Design
2. **[Canvas Performance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas_applications)** - MDN
3. **[Easing Functions Cheat Sheet](https://easings.net/)** - 可视化缓动函数
4. **[Game Loop Pattern](https://gameprogrammingpatterns.com/game-loop.html)** - 游戏循环模式

---

**总结**：专业 Casino 游戏的核心在于**零延迟反馈**和**物理真实感**。通过 Optimistic UI 实现即时响应，通过 Canvas 实现 60fps 流畅动画，通过缓动曲线模拟真实物理，这三者的结合才能给用户带来沉浸式的游戏体验。
