import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Sword } from 'lucide-react';

function AttackCounter() {
  const { state } = useDamageCalculator();

  return (
    <div className="attack-counter">
      <div className="attack-counter-content">
        <Sword size={24} className="attack-counter-icon" />
        <div className="attack-counter-info">
          <div className="attack-counter-number">{state.attackCount}</div>
          <div className="attack-counter-label">
            {state.attackCount === 1 ? 'Attack' : 'Attacks'}
          </div>
        </div>
      </div>
      
      {/* Show additional info about combat state */}
      <div className="attack-counter-details">
        {state.frenzy && <span className="detail-tag detail-tag--frenzy">Frenzy</span>}
        {state.actionSurge && <span className="detail-tag detail-tag--surge">Action Surge</span>}
        {state.reloadOnBonusAction && state.attackCount > 6 && (
          <span className="detail-tag detail-tag--reload">Reload Bonus</span>
        )}
      </div>
    </div>
  );
}

export default AttackCounter;
