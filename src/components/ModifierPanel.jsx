import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Settings, Target, Zap, Heart } from 'lucide-react';

function ModifierPanel() {
  const { state, actions } = useDamageCalculator();
  const { modifiers } = state;

  const handleModifierChange = (key, value) => {
    // Allow empty string to enable clearing the field
    if (value === '') {
      actions.updateModifier(key, 0);
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      actions.updateModifier(key, numValue);
    }
  };

  const critRangeOptions = [
    { value: 20, label: '20 (Normal)' },
    { value: 19, label: '19-20 (Improved)' },
    { value: 18, label: '18-20 (Superior)' },
    { value: 17, label: '17-20 (Legendary)' }
  ];

  return (
    <div className="modifier-panel">
      <div className="panel-header">
        <Settings size={20} />
        <h3>Character Modifiers</h3>
      </div>
      
      <div className="modifier-grid">
        <div className="modifier-group">
          <label className="modifier-label">
            <Target size={16} />
            Proficiency Bonus
          </label>
          <input
            type="number"
            min="2"
            max="6"
            value={modifiers.proficiencyBonus || ''}
            onChange={(e) => handleModifierChange('proficiencyBonus', e.target.value)}
            className="modifier-input"
          />
        </div>

        <div className="modifier-group">
          <label className="modifier-label">
            <Target size={16} />
            To Hit Bonus
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={modifiers.toHitBonus || ''}
            onChange={(e) => handleModifierChange('toHitBonus', e.target.value)}
            className="modifier-input"
          />
        </div>

        <div className="modifier-group">
          <label className="modifier-label">
            <Zap size={16} />
            Damage Bonus
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={modifiers.damageBonus || ''}
            onChange={(e) => handleModifierChange('damageBonus', e.target.value)}
            className="modifier-input"
          />
        </div>

        <div className="modifier-group">
          <label className="modifier-label">
            <Heart size={16} />
            Critical Range
          </label>
          <select
            value={modifiers.critRange}
            onChange={(e) => handleModifierChange('critRange', e.target.value)}
            className="modifier-select"
          >
            {critRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="modifier-info">
        <p>
          <strong>Current Setup:</strong> +{modifiers.toHitBonus} to hit, 
          +{modifiers.damageBonus} damage, crits on {modifiers.critRange}+
        </p>
      </div>
    </div>
  );
}

export default ModifierPanel;
