import React, { useState } from 'react';
import './DonatePage.css';

const DonatePage = () => {
  const [copied, setCopied] = useState(null);

  const wallets = {
    xmr: {
      address: '0x6f19e070dEb995351bED201BB3Ca7283EC66A820',
      name: 'Monero (XMR)',
      recommended: true,
      features: ['完全匿名', '低手续费', '快速确认', '无法追踪'],
      suggested: '$20+'
    },
    btc: {
      address: 'bc1qc7h2qdt487zlrztcms5y4jdjpc8jkx0ps082h4',
      name: 'Bitcoin (BTC)',
      recommended: false,
      features: ['接受度最高', '流动性好', '交易较慢', '手续费较高'],
      suggested: '$50+'
    },
    ltc: {
      address: '0x6f19e070dEb995351bED201BB3Ca7283EC66A820',
      name: 'Litecoin (LTC)',
      recommended: false,
      features: ['超低手续费', '快速确认', '适合小额', '交易公开'],
      suggested: '$10+'
    }
  };

  const sponsorshipLevels = [
    {
      level: '🥉 支持者',
      amount: '$50+',
      benefits: [
        '在捐赠者名单中展示名称/昵称',
        '优先回复技术问题（24 小时内）',
        '月度感谢提及',
        '专属感谢徽章'
      ]
    },
    {
      level: '🥈 合作伙伴',
      amount: '$200+',
      benefits: [
        '包含支持者所有权益',
        '网站首页底部 Logo 展示（300x100px）',
        '专属 ProtonMail 联系方式',
        '季度报告（资金使用情况）',
        '友情链接优先位置',
        '客座文章发布机会（1 篇/季度）'
      ]
    },
    {
      level: '🥇 战略赞助商',
      amount: '$1000+',
      benefits: [
        '包含合作伙伴所有权益',
        '专门的合作页面展示',
        '首页侧边栏推荐位（1 个月）',
        '联合内容创作机会',
        '年度详细报告',
        '社交媒体推广（Twitter/Telegram）',
        '专属客户经理对接'
      ]
    }
  ];

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="donate-page">
      <div className="donate-container">
        {/* 头部 */}
        <header className="donate-header">
          <h1 className="donate-title">💰 捐赠与赞助</h1>
          <p className="donate-subtitle">
            感谢您对<strong>暗网博客 - Zero Day 研究与隐私保护</strong>的支持！<br />
            您的捐赠将帮助我们维持站点运营、提升服务质量，为更多人提供有价值的隐私保护技术内容。
          </p>
        </header>

        {/* 为什么需要支持 */}
        <section className="donate-section">
          <h2 className="section-title">🎯 为什么需要您的支持</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">✅</span>
              <h3>内容免费开放</h3>
              <p>所有文章免费阅读</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✅</span>
              <h3>无强制广告</h3>
              <p>不投放影响体验的弹窗广告</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✅</span>
              <h3>隐私优先</h3>
              <p>不追踪用户，不收集个人信息</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✅</span>
              <h3>独立运营</h3>
              <p>不接受资本控制，保持客观中立</p>
            </div>
          </div>
        </section>

        {/* 加密货币钱包 */}
        <section className="donate-section">
          <h2 className="section-title">💎 接受加密货币</h2>
          <p className="section-description">
            我们注重隐私，仅接受<strong>加密货币</strong>捐赠。所有交易都将得到最大程度的隐私保护。
          </p>

          <div className="wallets-grid">
            {Object.entries(wallets).map(([key, wallet]) => (
              <div key={key} className={`wallet-card ${wallet.recommended ? 'recommended' : ''}`}>
                {wallet.recommended && <div className="recommended-badge">⭐ 强烈推荐</div>}
                <h3>{wallet.name}</h3>
                
                <div className="wallet-address">
                  <code>{wallet.address}</code>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(wallet.address, key)}
                  >
                    {copied === key ? '✓ 已复制' : '📋 复制'}
                  </button>
                </div>

                <div className="wallet-features">
                  {wallet.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="suggested-amount">
                  建议金额：<strong>{wallet.suggested}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 赞助等级 */}
        <section className="donate-section">
          <h2 className="section-title">🏆 赞助等级与权益</h2>
          <div className="sponsorship-grid">
            {sponsorshipLevels.map((plan, index) => (
              <div key={index} className="sponsorship-card">
                <h3 className="plan-level">{plan.level}</h3>
                <div className="plan-amount">{plan.amount}</div>
                <ul className="benefits-list">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✅</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 财务透明度 */}
        <section className="donate-section">
          <h2 className="section-title">📊 财务透明度</h2>
          <p className="section-description">
            我们承诺<strong>完全透明</strong>地使用每一笔捐赠。
          </p>

          <div className="finance-table-wrapper">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>预算</th>
                  <th>实际支出</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tor 节点运营</td>
                  <td>$100</td>
                  <td>$95</td>
                  <td>隐藏服务服务器成本</td>
                </tr>
                <tr>
                  <td>服务器托管</td>
                  <td>$50</td>
                  <td>$48</td>
                  <td>VPS 主机费用</td>
                </tr>
                <tr>
                  <td>安全服务</td>
                  <td>$80</td>
                  <td>$75</td>
                  <td>SSL 证书、防护服务</td>
                </tr>
                <tr>
                  <td>内容创作</td>
                  <td>$200</td>
                  <td>$180</td>
                  <td>作者稿费、编辑成本</td>
                </tr>
                <tr>
                  <td>技术推广</td>
                  <td>$50</td>
                  <td>$45</td>
                  <td>导航站提交、SEO 工具</td>
                </tr>
                <tr className="total-row">
                  <td><strong>总计</strong></td>
                  <td><strong>$480</strong></td>
                  <td><strong>$443</strong></td>
                  <td>结余 $37</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="reserve-status">
            <h3>资金储备状况</h3>
            <div className="reserve-grid">
              <div className="reserve-item">
                <span className="label">当前储备：</span>
                <span className="value">$2,450</span>
              </div>
              <div className="reserve-item">
                <span className="label">月度消耗：</span>
                <span className="value">$443</span>
              </div>
              <div className="reserve-item">
                <span className="label">可运营月数：</span>
                <span className="value">约 5.5 个月</span>
              </div>
            </div>
            <p className="update-time">📅 更新时间：2026-03-20</p>
          </div>
        </section>

        {/* PGP 加密通信 */}
        <section className="donate-section">
          <h2 className="section-title">🔐 PGP 加密通信</h2>
          <p className="section-description">
            为确保通信安全，<strong>强烈建议</strong>使用 PGP 加密邮件联系。
          </p>

          <div className="pgp-section">
            <div className="pgp-info">
              <h3>PGP 公钥信息</h3>
              <ul className="pgp-details">
                <li><strong>用户 ID:</strong> 8888868@proton.me</li>
                <li><strong>指纹:</strong> 833E DC D5 D15A 3832 FEFF 47BA C760 0045 1F8F E160</li>
                <li><strong>算法:</strong> RSA-4096</li>
                <li><strong>创建日期:</strong> 2026 年</li>
              </ul>
            </div>

            <div className="pgp-key-block">
              <pre>
{`-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEabrzPhYJKwYBBAHaRw8BAQdA2/I1LfyTzYmKrphALpEn+DWbCpfB3+SR
/tguPaxL/VLNJTg4ODg4NjhAcHJvdG9uLm1lIDw4ODg4ODY4QHByb3Rvbi5t
ZT7CwBEEExYKAIMFgmm68z4DCwkHCRDHYABFH4/hYEUUAAAAAAAcACBzYWx0
QG5vdGF0aW9ucy5vcGVucGdwanMub3JnEj4I3VpUkLIUuBJIFXggeoE4PjsC
C/xSbjYwxDteawsDFQoIBBYAAgECGQECmwMCHgEWIQSzPtzV0Vo4Mv7/R7rH
YABFH4/hYAAAtN4BAOs4ZfssR0J+aW2cSp/1v1wy4OoOZsbwjvh/GpM+i3ny
AQC3jIeAKmriLWb7mWau3hEU96cT/jD6TQ25CectgRIiC844BGm68z4SCisG
AQQBl1UBBQEBB0C5JOMQy0FVkeOKq8IIUd7Dd/qeXI46TE8uhwu/2G/oMAMB
CAfCvgQYFgoAcAWCabrzPgkQx2AARR+P4WBFFAAAAAAAHAAgc2FsdEBub3Rh
dGlvbnMub3BlbnBncGpzLm9yZySu8f7dpcbgSX+ptY2KvvPyoEL20aDZ77Tw
TEqzTtL7ApsMFiEEsz7c1dFaODL+/0e6x2AARR+P4WAAAABuAQCNhVwjdktl
crDr9C8HKwV6ucNDcA0zdVwK1EOYrKP0fQD+Jp3oRXp7dqocWflSX/JHvxyr
97c58OAkZTeyh1sLuw8=
-----END PGP PUBLIC KEY BLOCK-----`}
              </pre>
            </div>
          </div>
        </section>

        {/* 重要提示 */}
        <section className="donate-section warning-section">
          <h2 className="section-title">⚠️ 重要提示</h2>
          <div className="warning-cards">
            <div className="warning-card">
              <h3>🔒 安全警告</h3>
              <ul>
                <li>捐赠前请仔细核对钱包地址</li>
                <li>区块链交易不可逆转</li>
                <li>建议先小额测试</li>
              </ul>
            </div>
            <div className="warning-card">
              <h3>🛡️ 防范诈骗</h3>
              <ul>
                <li>我们不会主动私信索要捐赠</li>
                <li>不会承诺投资回报</li>
                <li>不参与任何形式的 ICO 或代币销售</li>
              </ul>
            </div>
            <div className="warning-card">
              <h3>📋 免责声明</h3>
              <ul>
                <li>加密货币价格波动较大，请谨慎决策</li>
                <li>捐赠属于自愿行为，不支持退款</li>
                <li>本站不对加密货币交易风险负责</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="donate-footer">
          <p>最后更新：2026-03-19 | 财务状况：正常运营中</p>
          <p>感谢您的支持，让我们一起构建更好的暗网技术社区！🙏</p>
        </footer>
      </div>
    </div>
  );
};

export default DonatePage;
