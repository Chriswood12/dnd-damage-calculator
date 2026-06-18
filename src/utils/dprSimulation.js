import { rollDie, rollD20 } from './dice';

const simulateRound = (state, ac, mode = 'current') => {
    let roundResults = [];

    for (let i = 0; i < state.attackCount; i++) {
        const isExcluded = state.effects.excluded.list[i] === 1;
        if (isExcluded) continue;

        const isFirstAttack = i === 0;
        const hasReapersBlood = state.reapersBlood && isFirstAttack;
        const hasTripleAdvantage = state.effects.advantage.list[i] === 1;
        const hasDisadvantage = state.effects.disadvantage.list[i] === 1;
        const hasAdvantage = hasTripleAdvantage || hasReapersBlood;
        const hasSharpshooter = mode === 'noSS' ? false : (state.effects.sharpShooter.list[i] === 1);
        
        let hasHex = state.effects.hex.list[i] === 1;
        let hasBless = state.bless;

        if (mode === 'forceBless') {
            hasBless = true;
            hasHex = false;
        } else if (mode === 'forceHex') {
            hasHex = true;
            hasBless = false;
        }

        const hasCursed = state.effects.cursed.list[i] === 1;
        const hasTrip = state.effects.trip.list[i] === 1;

        const { result: toHitRoll } = rollD20(hasAdvantage && !hasTripleAdvantage, hasDisadvantage, hasTripleAdvantage);
        const baseCritRange = state.modifiers.critRangeExtended ? state.modifiers.critRange - 1 : state.modifiers.critRange;
        const effectiveCritRange = hasCursed ? Math.min(19, baseCritRange) : baseCritRange;
        const isCrit = state.globalCrit || toHitRoll >= effectiveCritRange;

        let weaponDamage = 0;
        let sides = 6;
        let count = 2;

        if (state.currentGunStack === 1) { sides = 8; count = 2; } 
        else if (state.currentGunStack === 2) { sides = 10; count = 2; } 
        else if (state.currentGunStack === 3) { sides = 12; count = 2; } 
        else if (state.currentGunStack >= 4) { sides = 8; count = 3; }

        if (isCrit) {
            weaponDamage = (sides * count);
            for(let k=0; k<count; k++) weaponDamage += rollDie(sides);
        } else {
            for(let k=0; k<count; k++) weaponDamage += rollDie(sides);
        }

        let piercing = weaponDamage + state.modifiers.damageBonus;
        if (hasSharpshooter) piercing += 10;

        if (hasTrip) {
            const tripRoll = rollDie(10);
            piercing += isCrit ? 10 + tripRoll : tripRoll;
        }

        let necrotic = 0;
        if (hasHex) {
            const hexRoll = rollDie(6);
            necrotic += isCrit ? 6 + hexRoll : hexRoll;
        }
        if (hasCursed) {
            piercing += state.modifiers.proficiencyBonus;
        }

        let reapersHitBonus = 0;
        if (hasReapersBlood && state.reapersBloodHp >= 10) {
            reapersHitBonus = Math.floor(state.reapersBloodHp / 10);
            const diceCount = reapersHitBonus * 2;
            let reapersNecroticDamage = 0;
            if (isCrit) {
                reapersNecroticDamage = (diceCount * 8);
                for(let k=0; k<diceCount; k++) reapersNecroticDamage += rollDie(8);
            } else {
                for(let k=0; k<diceCount; k++) reapersNecroticDamage += rollDie(8);
            }
            necrotic += reapersNecroticDamage;
        }

        let toHitBase = toHitRoll + state.modifiers.toHitBonus - (hasSharpshooter ? 5 : 0) + reapersHitBonus;
        if (hasBless) toHitBase += rollDie(4);

        roundResults.push({ id: i, toHit: toHitBase, isCrit, piercing, necrotic });
    }

    // Pass 2: Bond and Precision
    let misses = roundResults.filter(r => !r.isCrit && r.toHit < ac).sort((a, b) => b.toHit - a.toHit);

    if (state.emboldeningBond && misses.length > 0) {
        let bestBondTarget = misses.find(m => (ac - m.toHit) <= 4) || misses[0];
        bestBondTarget.toHit += rollDie(4);
        misses = roundResults.filter(r => !r.isCrit && r.toHit < ac).sort((a, b) => b.toHit - a.toHit);
    }

    for (let m of misses) {
        const hasPrecision = state.effects.precision.list[m.id] === 1;
        if (hasPrecision && (ac - m.toHit) <= 10) {
            m.toHit += rollDie(10);
        }
    }

    // Calculate final damage for the round
    let roundDamage = 0;
    for (let r of roundResults) {
        if (r.isCrit || r.toHit >= ac) {
            roundDamage += r.piercing + r.necrotic;
        }
    }

    return roundDamage;
};

export const simulateDPR = (state, iterations = 1000) => {
    const data = [];

    // We will test AC from 10 to 30
    for (let ac = 10; ac <= 30; ac++) {
        let totalCurrent = 0;
        let totalNoSS = 0;
        let totalBless = 0;
        let totalHex = 0;

        for (let iter = 0; iter < iterations; iter++) {
            totalCurrent += simulateRound(state, ac, 'current');
            totalNoSS += simulateRound(state, ac, 'noSS');
            totalBless += simulateRound(state, ac, 'forceBless');
            totalHex += simulateRound(state, ac, 'forceHex');
        }

        data.push({
            ac,
            dpr: parseFloat((totalCurrent / iterations).toFixed(2)),
            dprNoSS: parseFloat((totalNoSS / iterations).toFixed(2)),
            dprBless: parseFloat((totalBless / iterations).toFixed(2)),
            dprHex: parseFloat((totalHex / iterations).toFixed(2))
        });
    }

    return data;
};
