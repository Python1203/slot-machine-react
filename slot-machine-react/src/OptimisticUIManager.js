/**
 * Optimistic UI Manager - 乐观更新管理器
 * 处理 Casino 游戏的即时反馈和错误恢复
 */

class OptimisticUIManager {
  constructor(options = {}) {
    this.pendingActions = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 10000;
    
    // 回调函数
    this.onSuccess = options.onSuccess || (() => {});
    this.onFailure = options.onFailure || (() => {});
    this.onRollback = options.onRollback || (() => {});
  }
  
  /**
   * 执行乐观更新
   * @param {string} actionId - 唯一动作 ID
   * @param {Function} optimisticUpdate - 立即执行的 UI 更新函数
   * @param {Function} serverRequest - 服务器请求函数
   * @param {Function} rollback - 回滚函数（失败时调用）
   */
  async execute(actionId, optimisticUpdate, serverRequest, rollback) {
    // 1. 立即执行 UI 更新（Optimistic）
    optimisticUpdate();
    
    // 2. 记录待处理动作
    this.pendingActions.set(actionId, {
      status: 'pending',
      timestamp: Date.now(),
      attempts: 0
    });
    
    try {
      // 3. 发起服务器请求（带超时控制）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const result = await serverRequest(controller.signal);
      clearTimeout(timeoutId);
      
      // 4. 成功：更新状态
      this.pendingActions.set(actionId, {
        status: 'success',
        timestamp: Date.now(),
        result
      });
      
      this.onSuccess(result);
      return { success: true, result };
      
    } catch (error) {
      // 5. 失败：尝试重试或回滚
      const action = this.pendingActions.get(actionId);
      action.attempts++;
      
      if (action.attempts < this.maxRetries) {
        // 重试
        console.log(`🔄 重试 ${actionId} (${action.attempts}/${this.maxRetries})`);
        return this.execute(actionId, optimisticUpdate, serverRequest, rollback);
      } else {
        // 达到最大重试次数，执行回滚
        this.pendingActions.set(actionId, {
          status: 'failed',
          timestamp: Date.now(),
          error
        });
        
        rollback(error);
        this.onFailure(error);
        
        return { success: false, error };
      }
    } finally {
      // 6. 清理（延迟删除以便调试）
      setTimeout(() => {
        this.pendingActions.delete(actionId);
      }, 5000);
    }
  }
  
  /**
   * 批量执行多个乐观更新
   */
  async executeBatch(actions) {
    const results = [];
    
    for (const action of actions) {
      const result = await this.execute(
        action.id,
        action.optimisticUpdate,
        action.serverRequest,
        action.rollback
      );
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * 获取待处理动作状态
   */
  getPendingActions() {
    return Array.from(this.pendingActions.entries()).map(([id, data]) => ({
      id,
      ...data,
      duration: Date.now() - data.timestamp
    }));
  }
  
  /**
   * 取消 pending 动作
   */
  cancel(actionId) {
    const action = this.pendingActions.get(actionId);
    if (action && action.status === 'pending') {
      this.pendingActions.set(actionId, {
        ...action,
        status: 'cancelled'
      });
      return true;
    }
    return false;
  }
}

export default OptimisticUIManager;
