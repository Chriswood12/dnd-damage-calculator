import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Zap, Sword, RotateCcw, Target, Sparkles, Users, Skull } from 'lucide-react';

const CombatToggles = () => {
    const { state, actions } = useDamageCalculator();

    const toggles = [
        {
            label: 'Frenzy',
            active: state.frenzy,
            onClick: actions.toggleFrenzy,
            icon: <Zap className="icon" size={20} />,
            description: 'Adds extra attacks'
        },
        {
            label: 'Action Surge',
            active: state.actionSurge,
            onClick: actions.toggleActionSurge,
            icon: <Sword className="icon" size={20} />,
            description: 'Doubles attacks'
        },
        {
            label: 'Reload',
            active: state.reloadOnBonusAction,
            onClick: actions.toggleReload,
            icon: <RotateCcw className="icon" size={20} />,
            description: '+1 attack (Bonus Action)'
        },
        {
            label: 'Global Crit',
            active: state.globalCrit,
            onClick: actions.toggleGlobalCrit,
            icon: <Target className="icon" size={20} />,
            description: 'All hits are crits'
        },
        {
            label: 'Bless',
            active: state.bless,
            onClick: actions.toggleBless,
            icon: <Sparkles className="icon" size={20} />,
            description: '+1d4 to hit'
        },
        {
            label: 'Bond',
            active: state.emboldeningBond,
            onClick: actions.toggleEmboldeningBond,
            icon: <Users className="icon" size={20} />,
            description: '+1d4 to lowest'
        },
        {
            label: "Reaper's Blood",
            active: state.reapersBlood,
            onClick: actions.toggleReapersBlood,
            icon: <Skull className="icon" size={20} />,
            description: 'Adv, Hit, 2d8 Necrotic'
        }
    ];

    return (
        <div className="toggle-group">
            {toggles.map((toggle) => (
                <button
                    key={toggle.label}
                    className={`toggle-btn ${toggle.active ? 'active' : ''}`}
                    onClick={toggle.onClick}
                >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{toggle.label}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{toggle.description}</span>
                    </div>
                    {toggle.icon}
                </button>
            ))}
        </div>
    );
};

export default CombatToggles;
