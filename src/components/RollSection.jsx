import React from 'react';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { Dice1 } from 'lucide-react';
import './components.css';

function RollSection() {
  const { state, actions } = useDamageCalculator();

  // Utility function for dice rolling
  const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

  // Calculate damage die based on gun stack
  const getDamageDie = () => {
    switch (state.currentGunStack) {
      case 1: return 8;
      case 2: return 10;
      default: return 6;
    }
  };

  // Check if attack roll is a critical hit
  const isCriticalHit = (roll, advantage = false, reaper = false) => {
    if (state.globalCrit) return true;
    
    // Handle advantage or reaper's blood (roll 3 dice, take highest)
    if (advantage || reaper) {
      const rolls = [roll, rollDie(20), rollDie(20)];
      const highest = Math.max(...rolls);
      return highest >= state.modifiers.critRange;
    }
    
    return roll >= state.modifiers.critRange;
  };

  // Calculate to-hit roll
  const calculateToHit = (attackIndex) => {
    const effects = state.effects;
    const hasAdvantage = effects.advantage.list[attackIndex] === 1;
    const hasReaper = state.reapersBloodHp > 0 && attackIndex === 0;
    const useSharpShooter = effects.sharpShooter.list[attackIndex] === 1;
    
    let roll = rollDie(20);
    let bonusRolls = [];
    
    // Handle advantage or reaper
    if (hasAdvantage || hasReaper) {
      bonusRolls = [rollDie(20), rollDie(20)];
      roll = Math.max(roll, ...bonusRolls);
    }
    
    // Add reaper bonus if applicable
    let reaperBonus = 0;
    if (hasReaper) {
      reaperBonus = Math.floor(state.reapersBloodHp / 10);
    }
    
    let finalToHit = roll + state.modifiers.toHitBonus + reaperBonus;
    
    // Apply sharpshooter penalty
    if (useSharpShooter) {
      finalToHit -= 5;
    }
    
    const isCrit = isCriticalHit(roll, hasAdvantage, hasReaper);
    
    return {
      roll,
      bonusRolls,
      finalToHit,
      isCrit,
      reaperBonus
    };
  };

  // Calculate damage for a single attack
  const calculateAttackDamage = (attackIndex) => {
    const effects = state.effects;
    const useSharpShooter = effects.sharpShooter.list[attackIndex] === 1;
    const hasHex = effects.hex.list[attackIndex] === 1;
    const hasCurse = effects.cursed.list[attackIndex] === 1;
    const hasReaper = state.reapersBloodHp > 0 && attackIndex === 0;
    
    const toHitResult = calculateToHit(attackIndex);
    const damageDie = getDamageDie();
    
    // Base damage rolls
    const damage1 = rollDie(damageDie);
    const damage2 = rollDie(damageDie);
    let piercingDamage = damage1 + damage2 + state.modifiers.damageBonus;
    
    // Add sharpshooter damage
    if (useSharpShooter) {
      piercingDamage += 10;
    }
    
    // Add hexblade's curse
    if (hasCurse) {
      piercingDamage += state.modifiers.proficiencyBonus;
    }
    
    let necroticDamage = 0;
    
    // Add hex damage
    if (hasHex) {
      necroticDamage += rollDie(6);
    }
    
    // Add reaper damage
    if (hasReaper) {
      const reaperDice = Math.floor(state.reapersBloodHp / 10);
      for (let i = 0; i < reaperDice; i++) {
        necroticDamage += rollDie(8) + rollDie(8);
      }
    }
    
    // Handle critical hits
    if (toHitResult.isCrit) {
      // Double base weapon damage
      piercingDamage += 2 * damageDie;
      
      // Add crit damage for hex
      if (hasHex) {
        necroticDamage += 6;
      }
      
      // Add crit damage for reaper
      if (hasReaper) {
        const reaperDice = Math.floor(state.reapersBloodHp / 10);
        necroticDamage += reaperDice * 16;
      }
    }
    
    return {
      attackIndex,
      toHit: toHitResult,
      piercingDamage,
      necroticDamage,
      totalDamage: piercingDamage + necroticDamage,
      effects: {
        sharpShooter: useSharpShooter,
        hex: hasHex,
        curse: hasCurse,
        advantage: effects.advantage.list[attackIndex] === 1,
        reaper: hasReaper
      },
      baseDamageRolls: [damage1, damage2],
      damageDie
    };
  };

  // Main roll function
  const handleRoll = () => {
    const results = [];
    
    for (let i = 0; i < state.attackCount; i++) {
      results.push(calculateAttackDamage(i));
    }
    
    actions.setAttackResults(results);
    
    // Calculate totals
    const totals = results.reduce(
      (acc, result) => {
        acc.total += result.totalDamage;
        acc.necrotic += result.necroticDamage;
        acc.piercing += result.piercingDamage;
        return acc;
      },
      { total: 0, necrotic: 0, piercing: 0 }
    );
    
    actions.updateTotals(totals);
  };

  return (
    <div className="roll-section">
      <div className="roll-button-container">
        <button
          onClick={handleRoll}
          className="roll-button"
          disabled={state.attackCount === 0}
        >
          <Dice1 size={24} />
          <span>ROLL DAMAGE</span>
        </button>
      </div>
      
      <div className="roll-info">
        <p>
          Rolling {state.attackCount} {state.attackCount === 1 ? 'attack' : 'attacks'} 
          with d{getDamageDie()} damage dice
        </p>
        {state.modifiers.critRange < 20 && (
          <p className="crit-info">
            Critical hits on {state.modifiers.critRange}+ (expanded crit range)
          </p>
        )}
      </div>
    </div>
  );
}

export default RollSection;
