import React from 'react';
import { Dice6, Sword, Zap } from 'lucide-react';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-icon">
          <Dice6 size={32} />
        </div>
        <h1 className="header-title">
          <span className="title-main">Calcuryder</span>
          <span className="title-subtitle">D&D Damage Calculator</span>
        </h1>
        <div className="header-icons">
          <Sword size={24} />
          <Zap size={24} />
        </div>
      </div>
    </header>
  );
}

export default Header;
