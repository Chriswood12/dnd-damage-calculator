import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { rollDie, rollD20 } from '../utils/dice';

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
    reapersBlood: false,
    bless: false,
    emboldeningBond: false,

    // Configurable modifiers
    modifiers: {
        proficiencyBonus: 5, // Updated to +5 for level 14
        toHitBonus: 15,
        damageBonus: 8,
        critRange: 20,
        critRangeExtended: false,
    },

    // Attack configuration
    attackCount: 3,

    // Effect toggles for each attack
    effects: {
        sharpShooter: { list: [1, 1, 1], savedList: Array(8).fill(1) },
        hex: { list: [0, 0, 0], savedList: Array(8).fill(0) },
        cursed: { list: [0, 0, 0], savedList: Array(8).fill(0) },
        advantage: { list: [0, 0, 0], savedList: Array(8).fill(0) },
        disadvantage: { list: [0, 0, 0], savedList: Array(8).fill(0) },
        precision: { list: [0, 0, 0], savedList: Array(8).fill(0) },
        trip: { list: [0, 0, 0], savedList: Array(8).fill(0) },
        excluded: { list: [0, 0, 0], savedList: Array(8).fill(0) }
    },


    // Results (kept in state for initialization but recalculated in provider)
    targetAC: '',
    totalDamage: 0,
    necroticDamage: 0,
    piercingDamage: 0,
    attackResults: [],
    rollHistory: []
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
    SET_TARGET_AC: 'SET_TARGET_AC',
    SET_ATTACK_RESULTS: 'SET_ATTACK_RESULTS',
    UPDATE_TOTALS: 'UPDATE_TOTALS',
    RESET_STATE: 'RESET_STATE',
    TOGGLE_BLESS: 'TOGGLE_BLESS',
    TOGGLE_EMBOLDENING_BOND: 'TOGGLE_EMBOLDENING_BOND',
    TOGGLE_REAPERS_BLOOD: 'TOGGLE_REAPERS_BLOOD',
    ADD_TO_HISTORY: 'ADD_TO_HISTORY',
    CLEAR_HISTORY: 'CLEAR_HISTORY'
};

// Reducer function
function damageCalculatorReducer(state, action) {
    switch (action.type) {
        case actionTypes.TOGGLE_FRENZY: {
            const newFrenzy = !state.frenzy;
            const modifier = state.actionSurge ? 2 : 1;
            let newAttackCount = state.attackCount;

            // Handle the specific logic from the old code
            if (state.attackCount === 7) newAttackCount = 8;
            newAttackCount += newFrenzy ? modifier : -modifier;

            const finalAttackCount = Math.max(1, newAttackCount);
            const updatedEffects = { ...state.effects };

            Object.keys(updatedEffects).forEach(effectKey => {
                const effect = { ...updatedEffects[effectKey] };
                const newList = [...effect.list];
                while (newList.length < finalAttackCount) {
                    newList.push(effect.savedList[newList.length] || 0);
                }
                if (newList.length > finalAttackCount) {
                    newList.length = finalAttackCount;
                }
                updatedEffects[effectKey] = { ...effect, list: newList };
            });

            return {
                ...state,
                frenzy: newFrenzy,
                attackCount: finalAttackCount,
                effects: updatedEffects
            };
        }

        case actionTypes.TOGGLE_ACTION_SURGE: {
            const newActionSurge = !state.actionSurge;
            let surgAttackCount = state.attackCount;

            if (surgAttackCount === 7) surgAttackCount = 8;
            surgAttackCount = newActionSurge ? surgAttackCount * 2 : surgAttackCount / 2;

            const surgFinalAttackCount = Math.max(1, Math.floor(surgAttackCount));
            const surgUpdatedEffects = { ...state.effects };

            Object.keys(surgUpdatedEffects).forEach(effectKey => {
                const effect = { ...surgUpdatedEffects[effectKey] };
                const newList = [...effect.list];
                while (newList.length < surgFinalAttackCount) {
                    newList.push(effect.savedList[newList.length] || 0);
                }
                if (newList.length > surgFinalAttackCount) {
                    newList.length = surgFinalAttackCount;
                }
                surgUpdatedEffects[effectKey] = { ...effect, list: newList };
            });

            return {
                ...state,
                actionSurge: newActionSurge,
                attackCount: surgFinalAttackCount,
                effects: surgUpdatedEffects
            };
        }

        case actionTypes.TOGGLE_RELOAD: {
            const newReload = !state.reloadOnBonusAction;
            const newAttackCount = state.attackCount + (newReload ? 1 : -1);
            const finalAttackCount = Math.max(1, newAttackCount);
            const updatedEffects = { ...state.effects };

            Object.keys(updatedEffects).forEach(effectKey => {
                const effect = { ...updatedEffects[effectKey] };
                const newList = [...effect.list];
                while (newList.length < finalAttackCount) {
                    newList.push(effect.savedList[newList.length] || 0);
                }
                if (newList.length > finalAttackCount) {
                    newList.length = finalAttackCount;
                }
                updatedEffects[effectKey] = { ...effect, list: newList };
            });

            return {
                ...state,
                reloadOnBonusAction: newReload,
                attackCount: finalAttackCount,
                effects: updatedEffects
            };
        }

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

        case actionTypes.TOGGLE_EFFECT: {
            const { effectType, index } = action.payload;
            const effect = state.effects[effectType];
            const newValue = effect.list[index] === 1 ? 0 : 1;

            if (newValue === 1 && (effectType === 'precision' || effectType === 'trip')) {
                const currentPrecision = state.effects.precision.list.reduce((a, b) => a + b, 0);
                const currentTrip = state.effects.trip.list.reduce((a, b) => a + b, 0);
                if (currentPrecision + currentTrip >= 5) {
                    return state;
                }
            }

            let newBless = state.bless;
            if (effectType === 'hex' && newValue === 1) {
                newBless = false;
            }

            return {
                ...state,
                bless: newBless,
                effects: {
                    ...state.effects,
                    [effectType]: {
                        ...effect,
                        list: effect.list.map((val, i) => i === index ? newValue : val),
                        savedList: effect.savedList.map((val, i) => i === index ? (newValue) : val)
                    }
                }
            };
        }

        case actionTypes.TOGGLE_ALL_EFFECTS: {
            const { effectType: allEffectType, enable } = action.payload;
            const allEffect = state.effects[allEffectType];

            if (enable && (allEffectType === 'precision' || allEffectType === 'trip')) {
                const otherEffectType = allEffectType === 'precision' ? 'trip' : 'precision';
                const otherManeuversUsed = state.effects[otherEffectType].list.reduce((a, b) => a + b, 0);
                let available = 5 - otherManeuversUsed;

                const newList = allEffect.list.map(() => {
                    if (available > 0) {
                        available--;
                        return 1;
                    }
                    return 0;
                });

                return {
                    ...state,
                    effects: {
                        ...state.effects,
                        [allEffectType]: {
                            ...allEffect,
                            list: newList,
                            savedList: allEffect.savedList.map((_, idx) => idx < newList.length ? newList[idx] : 0)
                        }
                    }
                };
            }

            const allValue = enable ? 1 : 0;
            
            let newBless = state.bless;
            if (allEffectType === 'hex' && enable) {
                newBless = false;
            }

            return {
                ...state,
                bless: newBless,
                effects: {
                    ...state.effects,
                    [allEffectType]: {
                        ...allEffect,
                        list: allEffect.list.map(() => allValue),
                        savedList: allEffect.savedList.map(() => allValue)
                    }
                }
            };
        }

        case actionTypes.SET_TARGET_AC:
            return { ...state, targetAC: action.payload };

        case actionTypes.SET_ATTACK_RESULTS:
            return { ...state, attackResults: action.payload };

        case actionTypes.ADD_TO_HISTORY:
            return { 
                ...state, 
                rollHistory: [action.payload, ...state.rollHistory].slice(0, 10) 
            };

        case actionTypes.CLEAR_HISTORY:
            return { ...state, rollHistory: [] };

        case actionTypes.UPDATE_TOTALS:
            return {
                ...state,
                totalDamage: action.payload.total,
                necroticDamage: action.payload.necrotic,
                piercingDamage: action.payload.piercing
            };

        case actionTypes.RESET_STATE:
            return { ...initialState };

        case actionTypes.TOGGLE_BLESS: {
            const newBless = !state.bless;
            let newEffects = state.effects;
            if (newBless) {
                newEffects = {
                    ...state.effects,
                    hex: {
                        ...state.effects.hex,
                        list: Array(state.attackCount).fill(0),
                        savedList: Array(state.attackCount).fill(0)
                    }
                };
            }
            return { ...state, bless: newBless, effects: newEffects };
        }

        case actionTypes.TOGGLE_EMBOLDENING_BOND:
            return { ...state, emboldeningBond: !state.emboldeningBond };

        case actionTypes.TOGGLE_REAPERS_BLOOD:
            return { ...state, reapersBlood: !state.reapersBlood };

        default:
            return state;
    }
}

// Context
const DamageCalculatorContext = createContext();

// Provider component
export function DamageCalculatorProvider({ children }) {
    const [state, dispatch] = useReducer(damageCalculatorReducer, initialState);

    const rollAttacks = useCallback(() => {
        const results = [];
        let totalPiercing = 0;
        let totalNecrotic = 0;

        for (let i = 0; i < state.attackCount; i++) {
            const isFirstAttack = i === 0;
            const hasReapersBlood = state.reapersBlood && isFirstAttack;

            const hasTripleAdvantage = state.effects.advantage.list[i] === 1;
            const hasDisadvantage = state.effects.disadvantage.list[i] === 1;
            const hasAdvantage = hasTripleAdvantage || hasReapersBlood;
            const hasSharpshooter = state.effects.sharpShooter.list[i] === 1;
            const hasHex = state.effects.hex.list[i] === 1;
            const hasCursed = state.effects.cursed.list[i] === 1;
            const hasPrecision = state.effects.precision.list[i] === 1;
            const hasTrip = state.effects.trip.list[i] === 1;
            const isExcluded = state.effects.excluded.list[i] === 1;

            const { result: toHitRoll, rolls: d20Rolls } = rollD20(hasAdvantage && !hasTripleAdvantage, hasDisadvantage, hasTripleAdvantage);
            const baseCritRange = state.modifiers.critRangeExtended ? state.modifiers.critRange - 1 : state.modifiers.critRange;
            const effectiveCritRange = hasCursed ? Math.min(19, baseCritRange) : baseCritRange;
            const isCrit = state.globalCrit || toHitRoll >= effectiveCritRange;

            // Weapon damage logic based on gun stack
            let weaponDamage = 0;
            let sides = 6;
            let count = 2;

            if (state.currentGunStack === 1) {
                sides = 8; count = 2;
            } else if (state.currentGunStack === 2) {
                sides = 10; count = 2;
            } else if (state.currentGunStack === 3) {
                sides = 12; count = 2;
            } else if (state.currentGunStack >= 4) {
                sides = 8; count = 3;
            }

            const weaponDiceRolls = Array.from({ length: count }, () => rollDie(sides));
            if (isCrit) {
                // Max + Roll logic
                weaponDamage = (sides * count) + weaponDiceRolls.reduce((a, b) => a + b, 0);
            } else {
                weaponDamage = weaponDiceRolls.reduce((a, b) => a + b, 0);
            }

            let piercing = weaponDamage + state.modifiers.damageBonus;
            if (hasSharpshooter) piercing += 10;

            let tripRoll = 0;
            if (hasTrip) {
                tripRoll = rollDie(10);
                if (isCrit) {
                    piercing += 10 + tripRoll;
                } else {
                    piercing += tripRoll;
                }
            }

            // Note: currentGunStack value itself doesn't add flat damage here, 
            // it changes the dice above. If it should also add flat damage, 
            // we can add it back: piercing += state.currentGunStack;

            let necrotic = 0;
            let hexRoll = 0;
            if (hasHex) {
                hexRoll = rollDie(6);
                if (isCrit) {
                    necrotic += 6 + hexRoll; // Max + Roll for 1d6
                } else {
                    necrotic += hexRoll;
                }
            }
            if (hasCursed) {
                piercing += state.modifiers.proficiencyBonus;
            }
            if (state.reapersBloodHp > 0) {
                // Remove the old logic: necrotic += Math.floor(state.reapersBloodHp / 10);
            }

            let reapersNecroticRolls = [];
            let reapersNecroticDamage = 0;
            let reapersHitBonus = 0;

            if (hasReapersBlood && state.reapersBloodHp >= 10) {
                reapersHitBonus = Math.floor(state.reapersBloodHp / 10);
                const diceCount = reapersHitBonus * 2; // 2d8 per 10 HP
                reapersNecroticRolls = Array.from({ length: diceCount }, () => rollDie(8));

                if (isCrit) {
                    // Max + Roll logic
                    reapersNecroticDamage = (diceCount * 8) + reapersNecroticRolls.reduce((a, b) => a + b, 0);
                } else {
                    reapersNecroticDamage = reapersNecroticRolls.reduce((a, b) => a + b, 0);
                }
                necrotic += reapersNecroticDamage;
            }

            let toHitBase = toHitRoll + state.modifiers.toHitBonus - (hasSharpshooter ? 5 : 0) + reapersHitBonus;

            let blessBonus = 0;
            if (state.bless) {
                blessBonus = rollDie(4);
                toHitBase += blessBonus;
            }

            let toHit = toHitBase;
            
            // We will defer Precision and Bond logic to a second pass so we can optimize
            // based on the target AC.

            results.push({
                id: i,
                toHit,
                isCrit,
                isExcluded,
                piercing,
                necrotic,
                total: piercing + necrotic,
                breakdown: {
                    weaponDiceRolls,
                    weaponSides: sides,
                    weaponCount: count,
                    hexRoll,
                    blessBonus,
                    reapersHitBonus,
                    reapersNecroticDamage,
                    reapersNecroticRolls,
                    hasSharpshooter,
                    hasPrecision: false,
                    hasTrip,
                    precisionRoll: 0,
                    tripRoll,
                    cursedDamage: hasCursed ? state.modifiers.proficiencyBonus : 0,
                    d20Rolls
                }
            });

            if (!isExcluded) {
                totalPiercing += piercing;
                totalNecrotic += necrotic;
            }
        }

        const ac = parseInt(state.targetAC);
        const hasTargetAC = !isNaN(ac) && state.targetAC !== '';

        // Pass 2: Apply Emboldening Bond and Precision optimally
        if (hasTargetAC) {
            // Find misses, sorted by closest to hitting
            let misses = results.filter(r => !r.isCrit && r.toHit < ac).sort((a, b) => b.toHit - a.toHit);

            // Apply Bond to the miss most likely to become a hit (needs <= 4)
            if (state.emboldeningBond && misses.length > 0) {
                let bestBondTarget = misses.find(m => (ac - m.toHit) <= 4) || misses[0];
                const bondBonus = rollDie(4);
                bestBondTarget.toHit += bondBonus;
                bestBondTarget.bondBonus = bondBonus;
                
                // Re-evaluate misses in case bond made it hit
                misses = results.filter(r => !r.isCrit && r.toHit < ac).sort((a, b) => b.toHit - a.toHit);
            }

            // Apply Precision to misses most likely to become a hit (needs <= 10)
            for (let m of misses) {
                const hasPrecision = state.effects.precision.list[m.id] === 1;
                if (hasPrecision && (ac - m.toHit) <= 10) {
                    const pRoll = rollDie(10);
                    m.toHit += pRoll;
                    m.breakdown.hasPrecision = true;
                    m.breakdown.precisionRoll = pRoll;
                }
            }
        } else {
            // No Target AC, just apply them
            for (let r of results) {
                if (state.effects.precision.list[r.id] === 1 && !r.isCrit) {
                    const pRoll = rollDie(10);
                    r.toHit += pRoll;
                    r.breakdown.hasPrecision = true;
                    r.breakdown.precisionRoll = pRoll;
                }
            }
            if (state.emboldeningBond && results.length > 0) {
                let lowestTarget = results.reduce((min, r) => r.toHit < min.toHit ? r : min, results[0]);
                const bondBonus = rollDie(4);
                lowestTarget.toHit += bondBonus;
                lowestTarget.bondBonus = bondBonus;
            }
        }

        // Recalculate totals
        totalPiercing = 0;
        totalNecrotic = 0;
        for (let r of results) {
            if (!r.isExcluded) {
                totalPiercing += r.piercing;
                totalNecrotic += r.necrotic;
            }
        }

        dispatch({ type: actionTypes.SET_ATTACK_RESULTS, payload: results });
        
        // Also save to history if there are results
        if (results.length > 0) {
            dispatch({ 
                type: actionTypes.ADD_TO_HISTORY, 
                payload: { 
                    timestamp: new Date().toISOString(), 
                    results,
                    totalPiercing,
                    totalNecrotic,
                    targetAC: state.targetAC
                } 
            });
        }
    }, [state]);

    const totals = useMemo(() => {
        let piercing = 0;
        let necrotic = 0;

        const ac = parseInt(state.targetAC);
        const hasTargetAC = !isNaN(ac) && state.targetAC !== '';

        state.attackResults.forEach((res, i) => {
            const isExcluded = state.effects.excluded.list[i] === 1;
            const isMiss = hasTargetAC && res.toHit < ac && !res.isCrit;

            if (!isExcluded && !isMiss) {
                piercing += res.piercing;
                necrotic += res.necrotic;
            }
        });

        return {
            total: piercing + necrotic,
            piercing,
            necrotic
        };
    }, [state.attackResults, state.effects.excluded.list]);

    // Action creators
    const actions = {
        toggleFrenzy: useCallback(() => dispatch({ type: actionTypes.TOGGLE_FRENZY }), []),
        toggleActionSurge: useCallback(() => dispatch({ type: actionTypes.TOGGLE_ACTION_SURGE }), []),
        toggleReload: useCallback(() => dispatch({ type: actionTypes.TOGGLE_RELOAD }), []),
        toggleGlobalCrit: useCallback(() => dispatch({ type: actionTypes.TOGGLE_GLOBAL_CRIT }), []),

        setTargetAC: useCallback((value) => dispatch({
            type: actionTypes.SET_TARGET_AC,
            payload: value
        }), []),

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

        rollAttacks,

        toggleBless: useCallback(() => dispatch({ type: actionTypes.TOGGLE_BLESS }), []),
        toggleEmboldeningBond: useCallback(() => dispatch({ type: actionTypes.TOGGLE_EMBOLDENING_BOND }), []),
        toggleReapersBlood: useCallback(() => dispatch({ type: actionTypes.TOGGLE_REAPERS_BLOOD }), []),

        clearHistory: useCallback(() => dispatch({ type: actionTypes.CLEAR_HISTORY }), []),

        resetState: useCallback(() => dispatch({ type: actionTypes.RESET_STATE }), [])
    };

    const value = {
        state: {
            ...state,
            totalDamage: totals.total,
            piercingDamage: totals.piercing,
            necroticDamage: totals.necrotic
        },
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
