/**
 * Rolls a die with the given number of sides.
 * @param {number} sides - The number of sides on the die.
 * @returns {number} - The result of the roll.
 */
export const rollDie = (sides) => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Rolls multiple dice and returns the sum.
 * @param {number} count - The number of dice to roll.
 * @param {number} sides - The number of sides on each die.
 * @returns {number} - The total sum of the rolls.
 */
export const rollDice = (count, sides) => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += rollDie(sides);
  }
  return total;
};

/**
 * Rolls a d20 with advantage, disadvantage, or triple advantage.
 * @param {boolean} advantage - Whether to roll with advantage (2d20 keep highest).
 * @param {boolean} disadvantage - Whether to roll with disadvantage (2d20 keep lowest).
 * @param {boolean} tripleAdvantage - Whether to roll with triple advantage (3d20 keep highest).
 * @returns {object} - { result, rolls } where result is the final value and rolls is an array of all d20s rolled.
 */
export const rollD20 = (advantage = false, disadvantage = false, tripleAdvantage = false) => {
  const rolls = [rollDie(20)];

  if (tripleAdvantage) {
    rolls.push(rollDie(20));
    rolls.push(rollDie(20));
    return { result: Math.max(...rolls), rolls };
  }

  if (advantage) {
    rolls.push(rollDie(20));
    return { result: Math.max(...rolls), rolls };
  }

  if (disadvantage) {
    rolls.push(rollDie(20));
    return { result: Math.min(...rolls), rolls };
  }

  return { result: rolls[0], rolls };
};

/**
 * Parses a dice string (e.g. "2d4+10 + 5d8 - 2") and evaluates it.
 * @param {string} diceString - The string to parse.
 * @returns {object} - { total, breakdown }
 */
export const parseAndRollDiceString = (diceString) => {
  if (!diceString) return null;
  const normalized = diceString.replace(/\s+/g, '').toLowerCase();
  
  const tokens = normalized.match(/([+-]?(?:\d*d\d+|\d+))/g);
  if (!tokens) return null;
  
  let total = 0;
  const breakdown = [];
  
  tokens.forEach(token => {
    let sign = 1;
    if (token.startsWith('-')) sign = -1;
    if (token.startsWith('+') || token.startsWith('-')) {
      token = token.substring(1);
    }
    
    if (token.includes('d')) {
      let [countStr, sidesStr] = token.split('d');
      const count = countStr === '' ? 1 : parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);
      
      const rolls = [];
      let sum = 0;
      for (let i = 0; i < count; i++) {
        const roll = rollDie(sides);
        rolls.push(roll);
        sum += roll;
      }
      
      const val = sum * sign;
      total += val;
      breakdown.push({
        type: 'dice',
        count,
        sides,
        sign,
        rolls,
        value: val
      });
    } else {
      const val = parseInt(token, 10) * sign;
      total += val;
      breakdown.push({
        type: 'constant',
        sign,
        value: val
      });
    }
  });
  
  return { total, breakdown };
};
