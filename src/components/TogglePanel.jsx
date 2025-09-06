import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Zap, Swords, RotateCcw, Crosshair, Target, Heart } from 'lucide-react';
import clsx from 'clsx';

function TogglePanel() {
  const { state, actions } = useDamageCalculator();

  const ToggleButton = ({ active, onClick, icon: Icon, label, className }) => (
    <button
      onClick={onClick}
      className={clsx(
        'toggle-button',
        { 'toggle-button--active': active },
        className
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  const GunStackButton = ({ value, currentValue, onClick, label }) => (
    <button
      onClick={() => onClick(value)}
      className={clsx(
        'gun-stack-button',
        { 'gun-stack-button--active': currentValue === value }
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="toggle-panel">
      <div className="toggle-section">
        <h4 className="toggle-section-title">Combat Actions</h4>
        <div className="toggle-group">
          <ToggleButton
            active={state.frenzy}
            onClick={actions.toggleFrenzy}
            icon={Swords}
            label="Frenzy"
          />
          <ToggleButton
            active={state.actionSurge}
            onClick={actions.toggleActionSurge}
            icon={Zap}
            label="Action Surge"
          />
          {state.attackCount > 6 && (
            <ToggleButton
              active={state.reloadOnBonusAction}
              onClick={actions.toggleReload}
              icon={RotateCcw}
              label="Reload on Bonus"
              className="toggle-button--warning"
            />
          )}
        </div>
      </div>

      <div className="toggle-section">
        <h4 className="toggle-section-title">Weapon Settings</h4>
        <div className="toggle-group">
          <div className="gun-stack-group">
            <label className="gun-stack-label">Current Gun Stack</label>
            <div className="gun-stack-buttons">
              <GunStackButton
                value={0}
                currentValue={state.currentGunStack}
                onClick={actions.setGunStack}
                label="0"
              />
              <GunStackButton
                value={1}
                currentValue={state.currentGunStack}
                onClick={actions.setGunStack}
                label="1"
              />
              <GunStackButton
                value={2}
                currentValue={state.currentGunStack}
                onClick={actions.setGunStack}
                label="2"
              />
            </div>
          </div>
          
          <div className="hp-input-group">
            <label className="hp-input-label">
              <Heart size={16} />
              Reaper's Blood HP
            </label>
            <input
              type="number"
              min="0"
              max="999"
              value={state.reapersBloodHp || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  actions.setReapersHp(0);
                } else {
                  const numValue = parseInt(value, 10);
                  actions.setReapersHp(isNaN(numValue) ? 0 : numValue);
                }
              }}
              className="hp-input"
              placeholder="Enter HP"
            />
          </div>
        </div>
      </div>

      <div className="toggle-section">
        <h4 className="toggle-section-title">Special</h4>
        <div className="toggle-group">
          <ToggleButton
            active={state.globalCrit}
            onClick={actions.toggleGlobalCrit}
            icon={Crosshair}
            label="Auto Crit"
            className="toggle-button--danger"
          />
        </div>
      </div>
    </div>
  );
}

export default TogglePanel;
