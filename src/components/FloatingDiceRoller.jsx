import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseAndRollDiceString } from '../utils/dice';
import { Dices, X } from 'lucide-react';

const FloatingDiceRoller = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(false);

    const handleRoll = (e) => {
        e.preventDefault();
        setError(false);
        const res = parseAndRollDiceString(input);
        if (!res) {
            setError(true);
            setResult(null);
        } else {
            setResult(res);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 50,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--accent-blood)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    boxShadow: '0 4px 20px var(--accent-blood-glow)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                }}
            >
                {isOpen ? <X size={28} /> : <Dices size={28} />}
            </button>

            {/* Floating Widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="glass-card"
                        style={{
                            position: 'fixed',
                            bottom: '6.5rem',
                            right: '2rem',
                            zIndex: 49,
                            width: '350px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                        }}
                    >
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Dices size={20} /> Quick Roller
                        </h3>

                        <form onSubmit={handleRoll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Formula (e.g. 2d4+10 + 5d8)</label>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="2d4 + 10 + 5d8"
                                    style={{
                                        borderColor: error ? 'var(--accent-blood)' : 'rgba(255,255,255,0.1)'
                                    }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Roll!
                            </button>
                        </form>

                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                                        {result.total}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    {result.breakdown.map((item, idx) => {
                                        const signStr = item.sign > 0 ? (idx === 0 ? '' : '+') : '-';
                                        
                                        if (item.type === 'constant') {
                                            return (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Modifier</span>
                                                    <span>{signStr} {Math.abs(item.value)}</span>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        {signStr} {item.count}d{item.sides}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                                                        {item.rolls.map((r, i) => (
                                                            <span key={i} style={{ 
                                                                background: 'rgba(255,255,255,0.05)', 
                                                                padding: '0.1rem 0.4rem', 
                                                                borderRadius: '4px',
                                                                color: r === item.sides ? 'var(--accent-blood)' : r === 1 ? 'var(--text-muted)' : 'white'
                                                            }}>
                                                                {r}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingDiceRoller;
