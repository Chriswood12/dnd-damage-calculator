import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state with enhanced configurability
const initialState = {
  // Combat toggles
  frenzy: false,
  actionSurge: false,
  reloadOnBonusAction: false,
  globalCrit: false,
  
  // Gun/weapon settings
  currentGunStack: 0,
  reapersBloodHp: 0,
  
  // Configurable modifiers (new feature!)
  modifiers: {
    proficiencyBonus: 4,
    toHitBonus: 12,
    damageBonus: 6,
    critRange: 20, // Only natural 20s crit by default
    critRangeExtended: false, // For features like Champion Fighter
  },
  
  // Attack configuration
  attackCount: 3,
  
  // Effect toggles for each attack
  effects: {
    sharpShooter: { list: [1,1,1], savedList: Array(8).fill(1) },
    hex: { list: [0,0,0], savedList: Array(8).fill(0) },
    cursed: { list: [0,0,0], savedList: Array(8).fill(0) },
    advantage: { list: [0,0,0], savedList: Array(8).fill(0) }
  },
  
  // Results
  totalDamage: 0,
  necroticDamage: 0,
  piercingDamage: 0,
  attackResults: []
};

// Action types
const actionTypes = {
  TOGGLE_FRENZY: 'TOGGLE_FRENZY',
  TOGGLE_ACTION_SURGE: 'TOGGLE_ACTION_SURGE',  
  TOGGLE_RELOAD: 'TOGGLE_RELOAD',
  TOGGLE_GLOBAL_CRIT: 'TOGGLE_GLOBAL_CRIT',
  SET_GUN_STACK: 'SET_GUN_STACK',
  SET_REAPERS_HP: 'SET_REAPERS_HP',
  UPDATE_MODIFIER: 'UPDATE_MODIFIER',
  TOGGLE_EFFECT: 'TOGGLE_EFFECT',
  TOGGLE_ALL_EFFECTS: 'TOGGLE_ALL_EFFECTS',
  SET_ATTACK_RESULTS: 'SET_ATTACK_RESULTS',
  UPDATE_TOTALS: 'UPDATE_TOTALS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
function damageCalculatorReducer(state, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_FRENZY:
      const newFrenzy = !state.frenzy;
      const modifier = state.actionSurge ? 2 : 1;
      let newAttackCount = state.attackCount;
      
      if (state.attackCount === 7) newAttackCount = 8;
      newAttackCount += newFrenzy ? modifier : -modifier;
      
      // Ensure effect lists are sized correctly
      const updatedEffects = { ...state.effects };
      const finalAttackCount = Math.max(1, newAttackCount);
      
      Object.keys(updatedEffects).forEach(effectKey => {
        const effect = updatedEffects[effectKey];
        while (effect.list.length < finalAttackCount) {
          effect.list.push(effect.savedList[effect.list.length] || 0);
        }
      });
      
      return {
        ...state,
        frenzy: newFrenzy,
        attackCount: finalAttackCount,
        effects: updatedEffects
      };
      
    case actionTypes.TOGGLE_ACTION_SURGE:
      const newActionSurge = !state.actionSurge;
      let surgAttackCount = state.attackCount;
      
      if (surgAttackCount === 7) surgAttackCount = 8;
      surgAttackCount = newActionSurge ? surgAttackCount * 2 : surgAttackCount / 2;
      
      // Ensure effect lists are sized correctly
      const surgUpdatedEffects = { ...state.effects };
      const surgFinalAttackCount = Math.max(1, Math.floor(surgAttackCount));
      
      Object.keys(surgUpdatedEffects).forEach(effectKey => {
        const effect = surgUpdatedEffects[effectKey];
        while (effect.list.length < surgFinalAttackCount) {
          effect.list.push(effect.savedList[effect.list.length] || 0);
        }
      });
      
      return {
        ...state,
        actionSurge: newActionSurge,
        attackCount: surgFinalAttackCount,
        effects: surgUpdatedEffects
      };
      
    case actionTypes.TOGGLE_RELOAD:
      return {
        ...state,
        reloadOnBonusAction: !state.reloadOnBonusAction,
        attackCount: state.attackCount + (state.reloadOnBonusAction ? -1 : 1)
      };
      
    case actionTypes.TOGGLE_GLOBAL_CRIT:
      return { ...state, globalCrit: !state.globalCrit };
      
    case actionTypes.SET_GUN_STACK:
      return { ...state, currentGunStack: action.payload };
      
    case actionTypes.SET_REAPERS_HP:
      return { ...state, reapersBloodHp: Math.max(0, action.payload) };
      
    case actionTypes.UPDATE_MODIFIER:
      return {
        ...state,
        modifiers: {
          ...state.modifiers,
          [action.payload.key]: action.payload.value
        }
      };
      
    case actionTypes.TOGGLE_EFFECT:
      const { effectType, index } = action.payload;
      const effect = state.effects[effectType];
      const newValue = effect.list[index] === 1 ? 0 : 1;
      
      return {
        ...state,
        effects: {
          ...state.effects,
          [effectType]: {
            ...effect,
            list: effect.list.map((val, i) => i === index ? newValue : val),
            savedList: effect.savedList.map((val, i) => i === index ? newValue : val)
          }
        }
      };
      
    case actionTypes.TOGGLE_ALL_EFFECTS:
      const { effectType: allEffectType, enable } = action.payload;
      const allEffect = state.effects[allEffectType];
      const allValue = enable ? 1 : 0;
      
      return {
        ...state,
        effects: {
          ...state.effects,
          [allEffectType]: {
            ...allEffect,
            list: allEffect.list.map(() => allValue),
            savedList: allEffect.savedList.map(() => allValue)
          }
        }
      };
      
    case actionTypes.SET_ATTACK_RESULTS:
      return { ...state, attackResults: action.payload };
      
    case actionTypes.UPDATE_TOTALS:
      return {
        ...state,
        totalDamage: action.payload.total,
        necroticDamage: action.payload.necrotic,
        piercingDamage: action.payload.piercing
      };
      
    case actionTypes.RESET_STATE:
      return { ...initialState };
      
    default:
      return state;
  }
}

// Context
const DamageCalculatorContext = createContext();

// Provider component
export function DamageCalculatorProvider({ children }) {
  const [state, dispatch] = useReducer(damageCalculatorReducer, initialState);
  
  // Action creators
  const actions = {
    toggleFrenzy: useCallback(() => dispatch({ type: actionTypes.TOGGLE_FRENZY }), []),
    toggleActionSurge: useCallback(() => dispatch({ type: actionTypes.TOGGLE_ACTION_SURGE }), []),
    toggleReload: useCallback(() => dispatch({ type: actionTypes.TOGGLE_RELOAD }), []),
    toggleGlobalCrit: useCallback(() => dispatch({ type: actionTypes.TOGGLE_GLOBAL_CRIT }), []),
    
    setGunStack: useCallback((value) => dispatch({ 
      type: actionTypes.SET_GUN_STACK, 
      payload: value 
    }), []),
    
    setReapersHp: useCallback((value) => dispatch({ 
      type: actionTypes.SET_REAPERS_HP, 
      payload: value 
    }), []),
    
    updateModifier: useCallback((key, value) => dispatch({
      type: actionTypes.UPDATE_MODIFIER,
      payload: { key, value }
    }), []),
    
    toggleEffect: useCallback((effectType, index) => dispatch({
      type: actionTypes.TOGGLE_EFFECT,
      payload: { effectType, index }
    }), []),
    
    toggleAllEffects: useCallback((effectType, enable) => dispatch({
      type: actionTypes.TOGGLE_ALL_EFFECTS,
      payload: { effectType, enable }
    }), []),
    
    setAttackResults: useCallback((results) => dispatch({
      type: actionTypes.SET_ATTACK_RESULTS,
      payload: results
    }), []),
    
    updateTotals: useCallback((totals) => dispatch({
      type: actionTypes.UPDATE_TOTALS,
      payload: totals
    }), []),
    
    resetState: useCallback(() => dispatch({ type: actionTypes.RESET_STATE }), [])
  };
  
  const value = {
    state,
    actions
  };
  
  return (
    <DamageCalculatorContext.Provider value={value}>
      {children}
    </DamageCalculatorContext.Provider>
  );
}

// Custom hook
export function useDamageCalculator() {
  const context = useContext(DamageCalculatorContext);
  if (!context) {
    throw new Error('useDamageCalculator must be used within a DamageCalculatorProvider');
  }
  return context;
}

export { actionTypes };
