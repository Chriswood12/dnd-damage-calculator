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
        toHitBonus: 12,
        damageBonus: 6,
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
        excluded: { list: [0, 0, 0], savedList: Array(8).fill(0) }
    },


    // Results (kept in state for initialization but recalculated in provider)
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
    RESET_STATE: 'RESET_STATE',
    TOGGLE_BLESS: 'TOGGLE_BLESS',
    TOGGLE_EMBOLDENING_BOND: 'TOGGLE_EMBOLDENING_BOND',
    TOGGLE_REAPERS_BLOOD: 'TOGGLE_REAPERS_BLOOD'
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

            return {
                ...state,
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
        }

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

        case actionTypes.TOGGLE_BLESS:
            return { ...state, bless: !state.bless };

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
            const isExcluded = state.effects.excluded.list[i] === 1;

            const { result: toHitRoll, rolls: d20Rolls } = rollD20(hasAdvantage && !hasTripleAdvantage, hasDisadvantage, hasTripleAdvantage);
            const isCrit = state.globalCrit || toHitRoll >= (state.modifiers.critRangeExtended ? state.modifiers.critRange - 1 : state.modifiers.critRange);

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
                necrotic += state.modifiers.proficiencyBonus;
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

            let toHit = toHitRoll + state.modifiers.toHitBonus - (hasSharpshooter ? 5 : 0) + reapersHitBonus;
            let blessBonus = 0;
            if (state.bless) {
                blessBonus = rollDie(4);
                toHit += blessBonus;
            }

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
                    cursedDamage: hasCursed ? state.modifiers.proficiencyBonus : 0,
                    d20Rolls
                }
            });

            if (!isExcluded) {
                totalPiercing += piercing;
                totalNecrotic += necrotic;
            }
        }

        // Apply Emboldening Bond to the lowest roll
        if (state.emboldeningBond && results.length > 0) {
            let lowestIdx = 0;
            for (let i = 1; i < results.length; i++) {
                if (results[i].toHit < results[lowestIdx].toHit) {
                    lowestIdx = i;
                }
            }
            const bondBonus = rollDie(4);
            results[lowestIdx].toHit += bondBonus;
            results[lowestIdx].bondBonus = bondBonus; // Track it for display
        }

        dispatch({ type: actionTypes.SET_ATTACK_RESULTS, payload: results });
    }, [state]);

    const totals = useMemo(() => {
        let piercing = 0;
        let necrotic = 0;

        state.attackResults.forEach((res, i) => {
            const isExcluded = state.effects.excluded.list[i] === 1;
            if (!isExcluded) {
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
