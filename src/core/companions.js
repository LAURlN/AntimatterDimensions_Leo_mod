
// Companion Upgrades
export const CompanionUpgrades = {
  GRANDMA_DIET: {
    id: "grandma_diet",
    name: "Grandma Diet",
    description: "Grandmas steal fewer cookies from you.",
    maxLevel: 5,
    baseCost: 100,
    costMult: 2,
    formatEffect: lvl => {
      if (lvl === 0) return "Steals every 2nd cookie";
      if (lvl === 1) return "Steals every 3rd cookie";
      if (lvl === 2) return "Steals every 4th cookie";
      if (lvl === 3) return "Steals every 5th cookie";
      if (lvl === 4) return "Steals every 6th or 7th cookie (Random)";
      if (lvl === 5) return "Steals NOTHING!";
      return "Unknown";
    }
  },
  GRANDMA_LIFE: {
    id: "grandma_life",
    name: "Grandma Life",
    description: "Grandmas have a lower chance of dying while harvesting.",
    maxLevel: 5,
    baseCost: 100,
    costMult: 2,
    formatEffect: lvl => {
      const chance = (1 - (0.2 * lvl)).toFixed(1);
      return `${chance}% Death Chance`;
    }
  },
  SEED_ROT: {
    id: "seed_rot",
    name: "Healthy Seeds",
    description: "Seeds have a lower chance of rotting when harvested.",
    maxLevel: 5,
    baseCost: 100,
    costMult: 2,
    formatEffect: lvl => {
      const chance = (1 - (0.2 * lvl)).toFixed(1);
      return `${chance}% Rot Chance`;
    }
  },
  DINO_FAST_FALL: {
    id: "dino_fast_fall",
    name: "Dino Fast Fall",
    description: "Hold Shift while in the air to fall faster.",
    maxLevel: 1,
    baseCost: 1000,
    costMult: 1,
    formatEffect: lvl => lvl > 0 ? "Unlocked" : "Locked"
  },
  DINO_DOUBLE_JUMP: {
    id: "dino_double_jump",
    name: "Dino Double Jump",
    description: "Allows you to jump a second time while in mid-air.",
    maxLevel: 1,
    baseCost: 10000,
    costMult: 1,
    formatEffect: lvl => lvl > 0 ? "Unlocked" : "Locked"
  },
  DINO_SCORE_START: {
    id: "dino_score_start",
    name: "Head Start",
    description: "Start each Dino run at score 100 (and faster speed).",
    maxLevel: 1,
    baseCost: 5000,
    costMult: 1,
    formatEffect: lvl => lvl > 0 ? "Unlocked" : "Locked"
  },
  TICKSPEED_SEED_GROWTH: {
    id: "tickspeed_seed_growth",
    name: "Quantum Fertilization",
    description: "Tickspeed upgrades speed up seed growth (0.1% multiplicative per upgrade).",
    maxLevel: 1,
    baseCost: 100000,
    costMult: 1,
    formatEffect: lvl => {
      const mult = Math.pow(1.001, Tickspeed.totalUpgrades);
      const text = `${formatX(mult, 2, 3)} Seed Speed`;
      return lvl > 0 ? text : `(Potential: ${text})`;
    }
  },
  GALAXY_COOKIE_GAIN: {
    id: "galaxy_cookie_gain",
    name: "Galactic Cravings",
    description: "Each Antimatter Galaxy increases cookie gain by 50% (multiplicative).",
    maxLevel: 1,
    baseCost: 1000000,
    costMult: 1,
    formatEffect: lvl => {
      const mult = Decimal.pow(1.5, player.galaxies);
      const text = `${formatX(mult, 2, 2)} Cookie Gain`;
      return lvl > 0 ? text : `(Potential: ${text})`;
    }
  }
};

export const CompanionEffects = {
  ANTIMATTER: {
    id: "antimatter",
    description: "Multiplies Antimatter production",
    // Scaling is pow, so value is baseValue ^ count
    format: x => `Multiplies Antimatter production by ${formatX(x, 2, 2)}`,
    baseValue: 1.5,
    perLevel: 0.1,
    scaling: "pow",
    cost: 1,
    tier: 1
  },
  TICKSPEED: {
    id: "tickspeed",
    description: "Multiplies Tickspeed",
    format: x => `Divides Tickspeed interval by ${formatX(x, 2, 2)} (making it faster)`,
    baseValue: 1.1,
    perLevel: 0.02,
    scaling: "pow",
    cost: 1,
    tier: 1
  },
  BUY10: {
    id: "buy10",
    description: "Increases 'Buy 10' multiplier",
    format: x => `Increases "Buy 10" multiplier by +${format(x, 2, 2)}`,
    baseValue: 0.05,
    perLevel: 0.01,
    scaling: "add",
    cost: 1,
    tier: 1
  },
  INFINITIES: {
    id: "infinities",
    description: "Multiplies Infinities gained",
    format: x => `Multiplies Infinities gained by ${formatX(x, 2, 2)}`,
    baseValue: 2,
    perLevel: 0.4,
    scaling: "pow",
    cost: 2,
    tier: 2
  },
  IP: {
    id: "ip",
    description: "Multiplies Infinity Points gained",
    format: x => `Multiplies Infinity Points gained by ${formatX(x, 2, 2)}`,
    baseValue: 2,
    perLevel: 0.4,
    scaling: "pow",
    cost: 2,
    tier: 2
  },
  FREE_GALAXY: {
    id: "free_galaxy",
    format: x => `+${formatInt(x)} Free Galaxy (Requires Companion Level 5+)`,
    summaryFormat: x => `+${formatInt(x)} Free Galaxy`,
    baseValue: 0,
    scaling: "threshold",
    thresholds: [5, 10],
    type: "bonus",
    cost: 2,
    tier: 2
  },
  COOKIE_GAIN: {
    id: "cookie_gain",
    description: "Multiplies Cookie gain",
    format: x => `Multiplies Cookie gain by ${formatX(x, 2, 2)}`,
    baseValue: 2.0,
    perLevel: 0.1,
    scaling: "pow",
    cost: 1,
    tier: 1
  },
  DINO_SEED_SPEED: {
    id: "dino_seed_speed",
    description: "Speeds up Seed Growth based on Dino Score",
    format: x => `Seeds grow ${format(x, 2, 1)}% faster per Dino Score (Active only while playing Dino Game)`,
    baseValue: 1,
    perLevel: 0.2,
    scaling: "add",
    cost: 1,
    tier: 1
  },
  PURER_SUMMONS: {
    id: "purer_summons",
    description: "Increases chance to summon higher star companions",
    format: x => `+${format(x, 2, 2)}% chance for +1 Star (Additive, Max 6)`,
    baseValue: 1,
    perLevel: 0.2,
    scaling: "add",
    type: "bonus",
    cost: 2,
    tier: 2
  }
};

export class CompanionState {
  constructor(data) {
    this._data = data;
    this.stars = data.stars;
    this.effects = data.effects;
    this.uuid = data.uuid || Math.floor(Math.random() * 1e9);
    // Don't trigger the setter yet as it relies on this._data which we just set,
    // but the setter logic was flawed as it tried to use 'data' from scope.
    // We want to update the source data only if we are creating a fresh name.

    if (!this._data.name) {
      this._data.name = Companions.generateName();
    }
  }

  get isFavorite() {
    return this._data.isFavorite || false;
  }

  set isFavorite(value) {
    this._data.isFavorite = value;
  }

  set name(value) {
    if (this._data) {
      this._data.name = value;
    }
  }

  get name() {
    return this._data.name;
  }

  get level() {
    return this._data.level || 1;
  }

  set level(val) {
    this._data.level = val;
  }

  get levelUpCost() {
    if (this.level >= 10) return 0;
    return 10 * Math.pow(2, this.level - 1);
  }

  canLevelUp(cookies) {
    if (this.level >= 10) return false;
    return cookies.gte(this.levelUpCost);
  }

  levelUp() {
    if (this.level >= 10) return false;
    this.level++;
    return true;
  }



  get effectDescription() {
    // Group effects
    const counts = {};
    for (const effId of this.effects) {
      counts[effId] = (counts[effId] || 0) + 1;
    }

    return Object.keys(counts).map(effId => {
      const def = Object.values(CompanionEffects).find(e => e.id === effId);
      let val = 0;
      if (def.scaling === "pow") {
        val = Math.pow(def.baseValue, counts[effId]);
      } else {
        val = def.baseValue * counts[effId];
      }
      return def.format(val);
    }).join(", ");
  }
}

export const Companions = {
  get active() {
    return player.companions.active.map(c => c ? new CompanionState(c) : null);
  },

  get bank() {
    return player.companions.bank.map(c => c ? new CompanionState(c) : null);
  },

  _cookieHistory: [],
  _lastCookies: null,

  update(diff) {
    const now = Date.now();
    const currentCookies = player.cookies;

    if (this._lastCookies) {
      const gain = currentCookies.sub(this._lastCookies);
      if (gain.gt(0)) {
        this._cookieHistory.push({ t: now, val: gain });
      }
    }
    this._lastCookies = new Decimal(currentCookies);

    // Prune history (keep 60s)
    const cutoff = now - 60000;
    // Optimization: Check first element, if old, shift.
    while (this._cookieHistory.length > 0 && this._cookieHistory[0].t < cutoff) {
      this._cookieHistory.shift();
    }
  },

  get cookiesGainedLastMinute() {
    let total = new Decimal(0);
    for (const entry of this._cookieHistory) {
      total = total.add(entry.val);
    }
    return total;
  },

  get cookieMultiplier() {
    let mult = this.totalEffect("cookie_gain");
    if (this.upgradeLevel("galaxy_cookie_gain") > 0) {
      mult = mult.times(Decimal.pow(1.5, player.galaxies));
    }
    return mult;
  },

  totalEffect(effectId) {
    const def = Object.values(CompanionEffects).find(e => e.id === effectId);
    if (!def) return new Decimal(1);

    let totalMult = new Decimal(1);
    let totalAdd = new Decimal(0);

    for (const comp of this.active) {
      if (!comp) continue;

      // Count local stacks of this effect
      let count = 0;
      for (const eff of comp.effects) {
        if (eff === effectId) count++;
      }

      if (count === 0) continue;

      // Calculate base contribution with Level Scaling
      // Effect Value = (Base + (Level-1)*PerLevel)
      // Exception: Free Galaxy (thresholds)

      let effectValue = def.baseValue;
      const level = comp.level || 1;

      if (def.scaling === "threshold") {
        effectValue = 0;
        if (def.thresholds) {
          for (const t of def.thresholds) {
            if (level >= t) effectValue += 1;
          }
        }
      } else if (def.perLevel) {
        effectValue += (level - 1) * def.perLevel;
      }

      let localVal;
      if (def.scaling === "pow") {
        localVal = Decimal.pow(effectValue, count);
      } else {
        localVal = new Decimal(effectValue * count);
      }

      // Apply Motherlode bonus (x10)
      if (comp.name && comp.name.toLowerCase() === "motherlode") {
        // "Power up it's effects tenfold"
        // For multipliers: Value becomes Value * 10
        // For adders: Value becomes Value * 10
        localVal = localVal.times(10);
      }

      // Accumulate to global
      if (def.scaling === "pow") {
        totalMult = totalMult.times(localVal);
      } else {
        totalAdd = totalAdd.add(localVal);
      }
    }

    return def.scaling === "pow" ? totalMult : totalAdd;
  },

  // Upgrades
  upgradeLevel(id) {
    if (!player.companions.upgrades) return 0;
    return player.companions.upgrades[id] || 0;
  },

  upgradeCost(id) {
    const def = Object.values(CompanionUpgrades).find(u => u.id === id);
    if (!def) return new Decimal(0);
    const level = this.upgradeLevel(id);
    if (level >= def.maxLevel) return null; // Maxed

    // Cost: 100 * 2^level
    return new Decimal(def.baseCost * Math.pow(def.costMult, level));
  },

  buyUpgrade(id) {
    const cost = this.upgradeCost(id);
    if (!cost) return false; // Maxed

    if (player.cookies.lt(cost)) return false;

    player.cookies = player.cookies.sub(cost);

    if (!player.companions.upgrades) player.companions.upgrades = {};
    player.companions.upgrades[id] = (player.companions.upgrades[id] || 0) + 1;

    // Vue reactivity helper if needed, but array/object assignment usually okay if root exists
    // If adding new key to existing object:
    // Vue 2 needs Vue.set, but here we modify player object directly.
    // Game loop reactivity should handle deep modification if player is observed deep.
    // Usually player is deep watched or UI updates manually.

    return true;
  },

  summon(tier) {
    // Basic Summon: 10 Cookies, 1-3 Stars
    // Weights: 1*: 90%, 2*: 9%, 3*: 1%
    if (tier === "basic") {
      if (player.cookies.lt(10)) return false;
      player.cookies = player.cookies.sub(10);
      // ... rest of logic is shared? No, stars differ.
    } else if (tier === "mighty") {
      if (player.cookies.lt(10000)) return false; // Returns false or string? The UI expects string for error or false/object.
      // Let's refactor `summon` to handle cost and stars generically?
      // Or just keep separate blocks.
    }



    // Check safe to run first (though we already deducted cookies? No, doing checks before logic is better)
    // Actually we deducted cookies.
    // Let's check bank space FIRST.
    let bankFull = true;
    for (const slot of player.companions.bank) {
      if (slot === null) {
        bankFull = false;
        break;
      }
    }

    if (bankFull) {
      // Refund
      player.cookies = player.cookies.add(10);
      return "Bank Full";
    }

    const rand = Math.random();
    let stars = 1;
    if (rand < 0.01) stars = 3;
    else if (rand < 0.10) stars = 2;

    // Apply Purer Summons effect
    const bonusChance = this.totalEffect("purer_summons").toNumber();
    if (Math.random() * 100 < bonusChance) {
      stars = Math.min(stars + 1, 6);
    }

    const newComp = this.generateCompanion(stars);
    // console.log("Generated Companion:", newComp);

    // Add to bank
    let added = false;
    for (let i = 0; i < player.companions.bank.length; i++) {
      if (player.companions.bank[i] === null) {
        // Use splice for reactivity
        player.companions.bank.splice(i, 1, newComp);
        added = true;
        break;
      }
    }

    if (!added) {
      // Should have been caught by bankFull check, but safety net
      player.cookies = player.cookies.add(10);
      return "Bank Full (Error)";
    }

    return new CompanionState(newComp);
  },

  summonMighty() {
    // Mighty Summon: 10,000 Cookies, 3-5 Stars
    // Weights: 3*: 90%, 4*: 9%, 5*: 1%

    // Check cost
    if (player.cookies.lt(10000)) return "Not enough cookies";
    player.cookies = player.cookies.sub(10000);

    // Check bank space
    let bankFull = true;
    for (const slot of player.companions.bank) {
      if (slot === null) {
        bankFull = false;
        break;
      }
    }

    if (bankFull) {
      player.cookies = player.cookies.add(10000);
      return "Bank Full";
    }

    const rand = Math.random();
    let stars = 3;
    if (rand < 0.01) stars = 5;
    else if (rand < 0.10) stars = 4;

    // Apply Purer Summons effect
    const bonusChance = this.totalEffect("purer_summons").toNumber();
    if (Math.random() * 100 < bonusChance) {
      stars = Math.min(stars + 1, 6);
    }

    const newComp = this.generateCompanion(stars);

    // Add to bank
    let added = false;
    for (let i = 0; i < player.companions.bank.length; i++) {
      if (player.companions.bank[i] === null) {
        player.companions.bank.splice(i, 1, newComp);
        added = true;
        break;
      }
    }

    if (!added) {
      player.cookies = player.cookies.add(10000);
      return "Bank Full (Error)";
    }

    return new CompanionState(newComp);
  },

  delete(location, index) {
    if (location === "active") {
      player.companions.active[index] = null;
      // Vue reactivity might need a push if array index; but we handle updates in Tab.
      // However for array indices in Vue 2:
      player.companions.active.splice(index, 1, null);
    } else {
      player.companions.bank.splice(index, 1, null);
    }
  },

  deleteAllNonFavorite() {
    let count = 0;
    for (let i = 0; i < player.companions.bank.length; i++) {
      const comp = player.companions.bank[i];
      if (comp && !comp.isFavorite) {
        player.companions.bank.splice(i, 1, null);
        count++;
      }
    }
    return count;
  },

  generateName() {
    const adjectives = ["Shiny", "Quantum", "Cosmic", "Ethereal", "Void", "Spectral", "Infinite", "Dimensional", "Time", "Chaos"];
    const nouns = ["Orb", "Cube", "Shard", "Wisp", "Spirit", "Construct", "Essence", "Prism", "Fragment", "Core"];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  },

  generateCompanion(stars) {
    // Basic pool (Cost 1)
    let availableEffects = ["antimatter", "tickspeed", "buy10", "cookie_gain"];

    // Unlock at 1 Galaxy
    if (player.companions.records.hasUnlockedFarm) {
      availableEffects.push("dino_seed_speed");
    }

    // Post-Crunch pool
    if (PlayerProgress.infinityUnlocked()) {
      availableEffects.push("infinities", "ip", "free_galaxy", "purer_summons");
    }

    const effects = [];
    let points = stars;

    while (points > 0) {
      // Filter effects that we can afford
      const affordable = availableEffects.filter(id => {
        const def = Object.values(CompanionEffects).find(e => e.id === id);
        return (def.cost || 1) <= points;
      });

      if (affordable.length === 0) break; // Should not happen if we have 1-cost effects

      // Roll
      const randIndex = Math.floor(Math.random() * affordable.length);
      const selectedId = affordable[randIndex];
      const def = Object.values(CompanionEffects).find(e => e.id === selectedId);

      effects.push(selectedId);
      points -= (def.cost || 1);
    }

    return {
      stars: stars,
      effects: effects,
      uuid: Math.floor(Math.random() * 1e9),
      name: this.generateName(),
      isFavorite: false,
      level: 1
    };
  }
};

window.Companions = Companions;
