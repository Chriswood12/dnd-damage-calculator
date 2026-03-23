import React, { useState, useEffect } from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { ExternalLink, RefreshCw, X, Shield, Star, Briefcase, List } from 'lucide-react';

const DnDBeyondPanel = ({ isOpen, onClose }) => {
    const { state, actions } = useDamageCalculator();
    const [loading, setLoading] = useState(false);
    const [characterData, setCharacterData] = useState(null);
    const characterId = "68036061";
    const shareUrl = `https://www.dndbeyond.com/characters/${characterId}/mx215q`;

    const syncData = async () => {
        setLoading(true);
        try {
            // Note: Directly fetching from D&D Beyond might hit CORS in some browsers.
            // We use a public proxy for demonstration if needed, but let's try direct first.
            const response = await fetch(`https://character-service.dndbeyond.com/character/v5/character/${characterId}`);
            const json = await response.json();
            if (json.success) {
                const data = json.data;
                setCharacterData(data);

                // Example of auto-syncing proficiency
                const level = data.classes.reduce((acc, cls) => acc + cls.level, 0);
                const profBonus = Math.floor((level - 1) / 4) + 2;
                actions.updateModifier('proficiencyBonus', profBonus);
            }
        } catch (error) {
            console.error("Failed to fetch D&D Beyond data:", error);
            // Fallback: If it's a CORS issue, we just tell the user we couldn't fetch JSON but the iframe still works.
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="glass-card side-panel" style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: '450px',
            height: '100vh',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="var(--accent-blood)" />
                    D&D Beyond: {characterData?.name || 'Ryder'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={syncData} disabled={loading} style={{ padding: '0.4rem' }}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    </button>
                    <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Embedded Iframe */}
                <div style={{ height: '70%', minHeight: '400px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <iframe
                        title="DnDBeyond Character Sheet"
                        src={shareUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: '#121212'
                        }}
                    />
                </div>

                {/* Data Display */}
                <div style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <List size={18} /> Features & Inventory
                    </h4>

                    {!characterData ? (
                        <p style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>Click the sync button to pull features and inventory data.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="glass-card" style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                <strong style={{ color: 'var(--accent-blood)' }}>Skills & Saves:</strong>
                                <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {characterData.stats.map(s => (
                                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'][s.id - 1]}:</span>
                                            <span style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                <strong style={{ color: 'var(--accent-blood)' }}>Notable Items:</strong>
                                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                    {characterData.inventory.filter(i => i.definition.magic).slice(0, 5).map((item, idx) => (
                                        <li key={idx}>{item.definition.name}</li>
                                    ))}
                                    {characterData.inventory.length === 0 && <li>No magic items found.</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .side-panel {
                    background: rgba(15, 15, 15, 0.95) !important;
                    backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
};

export default DnDBeyondPanel;
