import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';

const WeaponSettings = () => {
    const { state, actions } = useDamageCalculator();

    return (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
            <h3>Weapon & Character Modifiers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div className="input-group">
                    <label>Gun Stack</label>
                    <input
                        type="number"
                        value={state.currentGunStack}
                        onChange={(e) => actions.setGunStack(parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className="input-group">
                    <label>Reaper's Blood HP</label>
                    <input
                        type="number"
                        value={state.reapersBloodHp}
                        onChange={(e) => actions.setReapersHp(parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className="input-group">
                    <label>Proficiency Bonus</label>
                    <input
                        type="number"
                        value={state.modifiers.proficiencyBonus}
                        onChange={(e) => actions.updateModifier('proficiencyBonus', parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className="input-group">
                    <label>To Hit Bonus</label>
                    <input
                        type="number"
                        value={state.modifiers.toHitBonus}
                        onChange={(e) => actions.updateModifier('toHitBonus', parseInt(e.target.value) || 0)}
                    />
                </div>
                <div className="input-group">
                    <label>Damage Bonus</label>
                    <input
                        type="number"
                        value={state.modifiers.damageBonus}
                        onChange={(e) => actions.updateModifier('damageBonus', parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>
        </div>
    );
};

export default WeaponSettings;
