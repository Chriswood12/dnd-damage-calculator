import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Play } from 'lucide-react';

const ResultsDisplay = () => {
    const { state, actions } = useDamageCalculator();

    return (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Combat Results</h2>
                <button className="btn btn-primary" onClick={actions.rollAttacks}>
                    <Play size={20} />
                    Roll Attacks
                </button>
            </div>

            <div className="results-summary">
                <div className="stat-box">
                    <span className="stat-label">Total Damage</span>
                    <span className="stat-value total">{state.totalDamage}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Piercing</span>
                    <span className="stat-value piercing">{state.piercingDamage}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Necrotic</span>
                    <span className="stat-value necrotic">{state.necroticDamage}</span>
                </div>
            </div>

            {state.attackResults.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Attack</th>
                                <th style={{ padding: '1rem' }}>To Hit</th>
                                <th style={{ padding: '1rem' }}>Piercing</th>
                                <th style={{ padding: '1rem' }}>Necrotic</th>
                                <th style={{ padding: '1rem' }}>Total</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.attackResults.map((res, index) => {
                                const isExcluded = state.effects.excluded.list[index] === 1;
                                return (
                                    <tr key={res.id} style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        background: res.isCrit ? 'rgba(153, 27, 27, 0.1)' : 'transparent',
                                        opacity: isExcluded ? 0.4 : 1
                                    }}>
                                        <td style={{ padding: '1rem' }}>
                                            #{index + 1} {res.isCrit && <span style={{ color: 'var(--accent-blood)', fontWeight: 800, fontSize: '0.75rem', textShadow: '0 0 5px var(--accent-blood)' }}>CRIT!</span>}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {res.toHit}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                d20: {res.breakdown?.d20Rolls?.join(', ')}
                                                {res.bondBonus && (
                                                    <span style={{ color: 'var(--accent-blue)' }}>
                                                        (+{res.bondBonus} Bond)
                                                    </span>
                                                )}
                                                {res.breakdown?.blessBonus > 0 && (
                                                    <span style={{ color: '#fbbf24', marginLeft: res.bondBonus || res.breakdown?.reapersHitBonus ? '0.5rem' : 0 }}>
                                                        (+{res.breakdown.blessBonus} Bless)
                                                    </span>
                                                )}
                                                {res.breakdown?.reapersHitBonus > 0 && (
                                                    <span style={{ color: 'var(--accent-blood)', marginLeft: res.bondBonus ? '0.5rem' : 0 }}>
                                                        (+{res.breakdown.reapersHitBonus} Reaper)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }} className="piercing">
                                            {res.piercing}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                {res.breakdown?.weaponCount}d{res.breakdown?.weaponSides}: {res.breakdown?.weaponDiceRolls.join(' + ')}
                                                {res.isCrit && <span style={{ color: 'var(--accent-blood)' }}> + {res.breakdown?.weaponCount * res.breakdown?.weaponSides} (Crit)</span>}
                                                {res.breakdown?.hasSharpshooter && <span style={{ color: '#ffffff' }}> + 10 (SS)</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }} className="necrotic">
                                            {res.necrotic}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                {res.breakdown?.hexRoll > 0 && (
                                                    <div>
                                                        1d6: {res.breakdown.hexRoll}
                                                        {res.isCrit && <span style={{ color: 'var(--accent-necrotic)' }}> + 6 (Crit)</span>}
                                                    </div>
                                                )}
                                                {res.breakdown?.reapersNecroticDamage > 0 && (
                                                    <div style={{ color: 'var(--accent-blood)' }}>
                                                        Reaper ({res.breakdown.reapersHitBonus * 2}d8): {res.breakdown.reapersNecroticRolls.join(' + ')}
                                                        {res.isCrit && <span style={{ color: 'var(--accent-necrotic)' }}> + {res.breakdown.reapersHitBonus * 2 * 8} (Crit)</span>}
                                                    </div>
                                                )}
                                                {res.breakdown?.cursedDamage > 0 && (
                                                    <div style={{ color: '#ffffff' }}>
                                                        Curse: +{res.breakdown.cursedDamage}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 700 }}>{res.total}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                className={`btn ${isExcluded ? 'btn-primary' : ''}`}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.4rem 0.8rem',
                                                    background: isExcluded ? 'var(--accent-blood)' : 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--border-color)',
                                                    color: isExcluded ? 'white' : 'var(--text-secondary)'
                                                }}
                                                onClick={() => actions.toggleEffect('excluded', index)}
                                            >
                                                {isExcluded ? 'Include' : 'Exclude'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;
