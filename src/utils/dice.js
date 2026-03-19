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
