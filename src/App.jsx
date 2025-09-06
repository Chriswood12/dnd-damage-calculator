import React from 'react';
import { DamageCalculatorProvider } from './context/DamageCalculatorContext';
import Header from './components/Header';
import ModifierPanel from './components/ModifierPanel';
import TogglePanel from './components/TogglePanel';
import AttackCounter from './components/AttackCounter';
import EffectsPanel from './components/EffectsPanel';
import RollSection from './components/RollSection';
import ResultsSection from './components/ResultsSection';
import './App.css';

function App() {
  return (
    <DamageCalculatorProvider>
      <div className="app">
        <Header />
        
        <div className="main-content">
          <div className="controls-section">
            <ModifierPanel />
            <TogglePanel />
            <AttackCounter />
            <EffectsPanel />
          </div>
          
          <div className="action-section">
            <RollSection />
          </div>
          
          <div className="results-section">
            <ResultsSection />
          </div>
        </div>
      </div>
    </DamageCalculatorProvider>
  );
}

export default App;
