import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Target, Zap, Skull, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import './components.css';

function EffectsPanel() {
  const { state, actions } = useDamageCalculator();

  const effectConfigs = [
    {
      key: 'sharpShooter',
      label: 'Sharpshooter',
      icon: Target,
      color: 'blue',
      description: '-5 to hit, +10 damage'
    },
    {
      key: 'hex',
      label: 'Hex',
      icon: Skull,
      color: 'purple',
      description: '+1d6 necrotic damage'
    },
    {
      key: 'cursed',
      label: "Hexblade's Curse",
      icon: Zap,
      color: 'red',
      description: '+proficiency bonus damage'
    },
    {
      key: 'advantage',
      label: 'Advantage',
      icon: TrendingUp,
      color: 'green',
      description: 'Roll twice, take higher'
    }
  ];

  const EffectToggle = ({ attack, effectKey, active, onClick }) => (
    <button
      onClick={onClick}
      className={clsx(
        'effect-toggle',
        { 'effect-toggle--active': active }
      )}
      title={`Toggle for attack ${attack + 1}`}
    >
      {attack + 1}
    </button>
  );

  const AllToggleButton = ({ effectKey, effectConfig }) => {
    const effect = state.effects[effectKey];
    const enabledCount = effect.list.slice(0, state.attackCount).reduce((sum, val) => sum + val, 0);
    const allEnabled = enabledCount === state.attackCount;
    const noneEnabled = enabledCount === 0;
    
    const handleToggleAll = () => {
      actions.toggleAllEffects(effectKey, !allEnabled);
    };

    return (
      <button
        onClick={handleToggleAll}
        className={clsx(
          'all-toggle-button',
          {
            'all-toggle-button--all': allEnabled,
            'all-toggle-button--some': !allEnabled && !noneEnabled,
            'all-toggle-button--none': noneEnabled
          }
        )}
      >
        {allEnabled ? 'All' : noneEnabled ? 'None' : `${enabledCount}/${state.attackCount}`}
      </button>
    );
  };

  return (
    <div className="effects-panel">
      <div className="effects-panel-header">
        <h3>Attack Effects</h3>
        <p className="effects-panel-subtitle">Toggle effects for each attack</p>
      </div>

      <div className="effects-grid">
        {effectConfigs.map((config) => {
          const Icon = config.icon;
          const effect = state.effects[config.key];
          
          return (
            <div key={config.key} className={`effect-row effect-row--${config.color}`}>
              <div className="effect-info">
                <div className="effect-header">
                  <Icon size={20} />
                  <span className="effect-name">{config.label}</span>
                </div>
                <div className="effect-description">{config.description}</div>
                <AllToggleButton effectKey={config.key} effectConfig={config} />
              </div>
              
              <div className="effect-toggles">
                {Array.from({ length: state.attackCount }, (_, index) => (
                  <EffectToggle
                    key={index}
                    attack={index}
                    effectKey={config.key}
                    active={effect.list[index] === 1}
                    onClick={() => actions.toggleEffect(config.key, index)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EffectsPanel;
