import React, { useState } from 'react';
import SlotMachinePro from './SlotMachinePro';
import DonatePage from './DonatePage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('game');

  return (
    <div className="App">
      {/* 导航栏 */}
      <nav className="main-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">🎰</span>
            <span className="brand-text">Cyberpunk Casino</span>
          </div>
          
          <div className="navbar-links">
            <button 
              className={`nav-btn ${currentPage === 'game' ? 'active' : ''}`}
              onClick={() => setCurrentPage('game')}
            >
              🎮 游戏
            </button>
            <button 
              className={`nav-btn ${currentPage === 'donate' ? 'active' : ''}`}
              onClick={() => setCurrentPage('donate')}
            >
              💰 捐赠
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="main-content">
        {currentPage === 'game' && <SlotMachinePro />}
        {currentPage === 'donate' && <DonatePage />}
      </main>

      {/* 浮动捐赠按钮（仅在游戏页面显示） */}
      {currentPage === 'game' && (
        <button 
          className="floating-donate-btn"
          onClick={() => setCurrentPage('donate')}
          title="支持我们"
        >
          💰 捐赠
        </button>
      )}

      {/* 页脚 */}
      <footer className="app-footer">
        <p>© 2026 Cyberpunk Casino | Privacy Focused | Decentralized</p>
        <p>
          <button 
            className="footer-donate-link"
            onClick={() => setCurrentPage('donate')}
          >
            💰 支持我们
          </button>
        </p>
      </footer>
    </div>
  );
}

export default App;
