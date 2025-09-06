import React, { useState } from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Target, Zap, Skull, TrendingUp, Plus, Check } from 'lucide-react';
import clsx from 'clsx';
import './components.css';

function ResultsSection() {
  const { state } = useDamageCalculator();
  const [selectedAttacks, setSelectedAttacks] = useState(new Set());

  const toggleAttackSelection = (attackIndex) => {
    const newSelected = new Set(selectedAttacks);
    if (newSelected.has(attackIndex)) {
      newSelected.delete(attackIndex);
    } else {
      newSelected.add(attackIndex);
    }
    setSelectedAttacks(newSelected);
  };

  const getSelectedTotals = () => {
    if (selectedAttacks.size === 0) {
      return { total: 0, necrotic: 0, piercing: 0 };
    }

    return state.attackResults
      .filter((_, index) => selectedAttacks.has(index))
      .reduce(
        (acc, result) => ({
          total: acc.total + result.totalDamage,
          necrotic: acc.necrotic + result.necroticDamage,
          piercing: acc.piercing + result.piercingDamage
        }),
        { total: 0, necrotic: 0, piercing: 0 }
      );
  };

  const formatToHitDisplay = (toHit) => {
    if (toHit.isCrit) {
      return { display: 'CRIT!', class: 'critical-hit' };
    }
    return { display: toHit.finalToHit.toString(), class: 'normal-hit' };
  };

  const getEffectTags = (effects) => {
    const tags = [];
    if (effects.sharpShooter) tags.push({ label: 'Sharp', icon: Target, color: 'blue' });
    if (effects.hex) tags.push({ label: 'Hex', icon: Skull, color: 'purple' });
    if (effects.curse) tags.push({ label: 'Curse', icon: Zap, color: 'red' });
    if (effects.advantage) tags.push({ label: 'Adv', icon: TrendingUp, color: 'green' });
    if (effects.reaper) tags.push({ label: 'Reaper', icon: Skull, color: 'orange' });
    return tags;
  };

  const selectedTotals = getSelectedTotals();
  const hasSelection = selectedAttacks.size > 0;

  return (
    <div className="results-section">
      {/* Quick Summary at Top */}
      {state.attackResults.length > 0 && (
        <div className="quick-summary">
          <div className="summary-card">
            <div className="summary-title">Total Damage</div>
            <div className="summary-value">{state.totalDamage}</div>
            <div className="summary-breakdown">
              {state.piercingDamage > 0 && <span>{state.piercingDamage} piercing</span>}
              {state.necroticDamage > 0 && <span>{state.necroticDamage} necrotic</span>}
            </div>
          </div>
          
          {hasSelection && (
            <div className="summary-card selection-card">
              <div className="summary-title">Selected ({selectedAttacks.size})</div>
              <div className="summary-value">{selectedTotals.total}</div>
              <div className="summary-breakdown">
                {selectedTotals.piercing > 0 && <span>{selectedTotals.piercing} piercing</span>}
                {selectedTotals.necrotic > 0 && <span>{selectedTotals.necrotic} necrotic</span>}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="results-header">
        <h3>Individual Attacks</h3>
        {state.attackResults.length > 1 && (
          <p className="results-subtitle">Click attacks to add to selection</p>
        )}
      </div>

      <div className="attack-results">
        {state.attackResults.length === 0 ? (
          <div className="no-results">
            <p>Click "ROLL DAMAGE" to calculate attack results</p>
          </div>
        ) : (
          <div className="attack-grid">
            {state.attackResults.map((result, index) => {
              const toHitDisplay = formatToHitDisplay(result.toHit);
              const effectTags = getEffectTags(result.effects);
              const isSelected = selectedAttacks.has(index);
              const isCrit = result.toHit.isCrit;

              return (
                <div
                  key={index}
                  className={clsx(
                    'attack-card',
                    { 'attack-card--selected': isSelected },
                    { 'attack-card--crit': isCrit }
                  )}
                  onClick={() => toggleAttackSelection(index)}
                >
                  {/* Attack Header */}
                  <div className="attack-card-header">
                    <div className="attack-number">#{index + 1}</div>
                    <div className={`to-hit-display ${toHitDisplay.class}`}>
                      {toHitDisplay.display}
                    </div>
                    <div className="selection-indicator">
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </div>
                  </div>

                  {/* Main Damage Display */}
                  <div className="damage-display">
                    <div className="total-damage-large">{result.totalDamage}</div>
                    <div className="damage-type-breakdown">
                      <div className="damage-type">
                        <span className="damage-amount">{result.piercingDamage}</span>
                        <span className="damage-label">piercing</span>
                      </div>
                      {result.necroticDamage > 0 && (
                        <div className="damage-type necrotic">
                          <span className="damage-amount">{result.necroticDamage}</span>
                          <span className="damage-label">necrotic</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Effects Display */}
                  {effectTags.length > 0 && (
                    <div className="effect-indicators">
                      {effectTags.map((tag, tagIndex) => {
                        const Icon = tag.icon;
                        return (
                          <div key={tagIndex} className={`effect-indicator effect-indicator--${tag.color}`}>
                            <Icon size={12} />
                            <span>{tag.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Roll Details (Compact) */}
                  <div className="roll-summary">
                    <span>d{result.damageDie}: {result.baseDamageRolls.join('+')}</span>
                    {result.toHit.bonusRolls.length > 0 && (
                      <span className="advantage-indicator">ADV</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsSection;
