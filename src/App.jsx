import React from 'react';
import { DamageCalculatorProvider } from './context/DamageCalculatorContext';
import CombatToggles from './components/CombatToggles';
import WeaponSettings from './components/WeaponSettings';
import AttackConfig from './components/AttackConfig';
import ResultsDisplay from './components/ResultsDisplay';
import { Skull, Swords } from 'lucide-react';

function App() {
  return (
    <DamageCalculatorProvider>
      <div className="app-container">
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--accent-blood)', boxShadow: 'var(--glow-red)' }}>
            <Skull size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>D&D Carnage Calculator</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 'bold' }}>Level 14 Slaughterer • Proficiency +5</p>
          </div>
        </header>

        <main>
          <section>
            <h2 style={{ marginBottom: '1rem' }}>Combat State</h2>
            <CombatToggles />
          </section>

          <WeaponSettings />

          <ResultsDisplay />

          <AttackConfig />
        </main>

        <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <p>Built for local use • Powered by React & Vite</p>
        </footer>
      </div>
    </DamageCalculatorProvider>
  );
}

export default App;
