import React from 'react';
import { motion } from 'framer-motion';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Clock, Trash2, ShieldAlert } from 'lucide-react';

const RollHistory = () => {
    const { state, actions } = useDamageCalculator();

    if (state.rollHistory.length === 0) {
        return null;
    }

    return (
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} />
                    Combat Log
                </h2>
                <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                    onClick={actions.clearHistory}
                >
                    <Trash2 size={14} />
                    Clear Log
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {state.rollHistory.map((entry, idx) => {
                    const timeString = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const grandTotal = entry.totalPiercing + entry.totalNecrotic;
                    
                    return (
                        <motion.div 
                            key={entry.timestamp}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card"
                            style={{ padding: '1rem', borderLeft: idx === 0 ? '4px solid var(--accent-gold)' : '4px solid transparent' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{timeString} {idx === 0 && '(Latest)'}</span>
                                {entry.targetAC && (
                                    <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                                        <ShieldAlert size={14} /> AC: {entry.targetAC}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{grandTotal} dmg</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    (<span className="piercing">{entry.totalPiercing} P</span> / <span className="necrotic">{entry.totalNecrotic} N</span>)
                                </span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {entry.results.map((r, i) => {
                                    let hitColor = 'var(--text-muted)';
                                    let hitText = r.toHit;
                                    if (r.isCrit) {
                                        hitColor = 'var(--accent-gold)';
                                        hitText = 'CRIT';
                                    } else if (entry.targetAC) {
                                        if (r.toHit >= parseInt(entry.targetAC)) {
                                            hitColor = 'var(--accent-blood)';
                                        }
                                    }
                                    return (
                                        <span key={i} style={{ padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                            Atk {i+1}: <span style={{ color: hitColor, fontWeight: 'bold' }}>{hitText}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RollHistory;
