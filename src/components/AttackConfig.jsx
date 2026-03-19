import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Crosshair, Ghost, Skull, ArrowUp, ArrowDown } from 'lucide-react';

const AttackConfig = () => {
    const { state, actions } = useDamageCalculator();

    const effectIcons = {
        sharpShooter: <Crosshair size={16} />,
        hex: <Ghost size={16} />,
        cursed: <Skull size={16} />,
        advantage: <ArrowUp size={16} />,
        disadvantage: <ArrowDown size={16} />
    };

    const effectLabels = {
        sharpShooter: 'Sharpshooter',
        hex: 'Hex',
        cursed: 'Cursed',
        advantage: 'Triple Advantage',
        disadvantage: 'Disadvantage'
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Attacks ({state.attackCount})</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {Object.keys(state.effects).filter(key => key !== 'excluded').map(effectType => (
                        <button
                            key={effectType}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => {
                                const allActive = state.effects[effectType].list.every(v => v === 1);
                                actions.toggleAllEffects(effectType, !allActive);
                            }}
                        >
                            Toggle All {effectLabels[effectType]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="attack-grid">
                {Array.from({ length: state.attackCount }).map((_, index) => (
                    <div key={index} className="glass-card attack-card">
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Attack #{index + 1}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Object.keys(state.effects).filter(key => key !== 'excluded').map(effectType => (
                                <button
                                    key={effectType}
                                    className={`toggle-btn ${state.effects[effectType].list[index] === 1 ? 'active' : ''}`}
                                    style={{ padding: '0.5rem 0.75rem' }}
                                    onClick={() => actions.toggleEffect(effectType, index)}
                                >
                                    <span style={{ fontSize: '0.875rem' }}>{effectLabels[effectType]}</span>
                                    {effectIcons[effectType]}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttackConfig;
