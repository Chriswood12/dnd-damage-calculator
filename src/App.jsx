import React from 'react';
import { DamageCalculatorProvider } from './context/DamageCalculatorContext';
import CombatToggles from './components/CombatToggles';
import WeaponSettings from './components/WeaponSettings';
import AttackConfig from './components/AttackConfig';
import ResultsDisplay from './components/ResultsDisplay';
import DnDBeyondPanel from './components/DnDBeyondPanel';
import { Skull, Swords, Shield } from 'lucide-react';


function App() {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  return (
    <DamageCalculatorProvider>
      <div className={`app-container ${isPanelOpen ? 'panel-open' : ''}`}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--accent-blood)', boxShadow: 'var(--glow-red)' }}>
              <Skull size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>D&D Carnage Calculator</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 'bold' }}>Level 14 Slaughterer • Proficiency +5</p>
            </div>
          </div>
          <button
            className={`btn ${isPanelOpen ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            <Shield size={20} />
            {isPanelOpen ? 'Hide Sheet' : 'D&D Beyond Sheet'}
          </button>
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

        <DnDBeyondPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

        <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <p>Built for local use • Powered by React & Vite</p>
        </footer>

        <style>{`
            .panel-open main, .panel-open header {
                margin-right: 450px;
                transition: margin-right 0.3s ease-out;
            }
            main, header {
                transition: margin-right 0.3s ease-out;
            }
            @media (max-width: 1000px) {
                .panel-open main, .panel-open header {
                    margin-right: 0;
                }
            }
        `}</style>
      </div>
    </DamageCalculatorProvider>
  );
}

export default App;
