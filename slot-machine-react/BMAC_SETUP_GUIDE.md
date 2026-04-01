# BMAC 配置指南

## 快速开始

### 1. 注册 Buy Me a Coffee 账号
访问 https://www.buymeacoffee.com 并注册账号

### 2. 获取用户名
登录后，你的个人页面 URL 为：`https://buymeacoffee.com/你的用户名`

例如：`https://buymeacoffee.com/johndoe` → 用户名为 `johndoe`

### 3. 修改配置文件

#### index.html (public 目录)
```html
<script data-name="BMC-Widget" 
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" 
        data-id="你的实际用户名"
        data-description="Support me on Buy me a coffee!"
        data-color="#FFDD00" 
        data-position="Right">
</script>
```

#### SlotMachinePro.js
```javascript
bmacIntegrationRef.current = new BMACIntegration({
  widgetId: '你的实际用户名', // 替换这里
  description: 'Support me on Buy me a coffee!',
  color: '#FFDD00'
});
```

### 4. 配置 Webhook（可选）

在 BMAC 后台设置 Webhook URL，当收到捐赠时会 POST 数据到你的服务器：

```json
{
  "user_id": "player_123",
  "amount": 5,
  "currency": "USD",
  "message": "Great game!"
}
```

### 5. 测试

1. 启动应用：`npm start`
2. 输光所有金币（<10）
3. 点击旋转按钮触发破产弹窗
4. 点击"请喝咖啡并回血"按钮
5. 应该看到右侧滑出 BMAC 浮窗

## 自定义选项

### Widget 位置
```javascript
data-position="Left"   // 左侧
data-position="Right"  // 右侧（默认）
```

### 主题颜色
```javascript
data-color="#FFDD00"  // 金黄色（默认）
data-color="#FF5722"  // 橙红色
data-color="#4CAF50"  // 绿色
```

### 边距调整
```javascript
data-x_margin="18"  // 水平边距（像素）
data-y_margin="18"  // 垂直边距（像素）
```

## 常见问题

### Q: Widget 不显示？
A: 检查以下几点：
1. 用户名是否正确
2. 浏览器控制台是否有错误
3. 网络是否能访问 buymeacoffee.com
4. 尝试清除缓存

### Q: 如何禁用 BMAC 使用传统弹窗？
A: 修改 SlotMachinePro.js：
```javascript
const [useBMAC, setUseBMAC] = useState(false); // 改为 false
```

### Q: 如何追踪捐赠来源？
A: 通过 user_id 参数：
```javascript
bmacIntegration.setUserId('player_' + userId);
bmacIntegration.display({
  user_id: 'player_' + userId,
  extra: `player_${userId}`
});
```

## 收益优化建议

1. **设置合理金额**：建议 $3-$5 起步
2. **添加会员等级**：提供月度赞助选项
3. **展示目标进度**：如"每月$500 服务器费用"
4. **回馈支持者**：在游戏内展示捐赠者名单
5. **定期更新内容**：保持玩家活跃度

## 技术支持

- BMAC 官方文档：https://docs.buymeacoffee.com
- Widget 配置：https://www.buymeacoffee.com/widget
