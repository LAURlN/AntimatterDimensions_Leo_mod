import { shortcuts } from "./hotkeys";

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
    baseValue: 2,
    perLevel: 0.4,
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

  get maxLevel() {
    let totalBonus = 0;
    const counts = {};

    // Count instances of each effect
    for (const effId of this.effects) {
      counts[effId] = (counts[effId] || 0) + 1;
    }

    // Calculate bonus based on Aggregate Effective Tier
    for (const [id, count] of Object.entries(counts)) {
      const def = Object.values(CompanionEffects).find(e => e.id === id);
      if (def) {
        const baseTier = def.tier || (def.cost || 1);
        const effectiveTier = baseTier * count;

        // Formula: (EffectiveTier - 1) * 2
        // Tier 1 -> 0
        // Tier 2 -> +2
        // Tier 6 -> +10
        if (effectiveTier > 1) {
          totalBonus += (effectiveTier - 1) * 2;
        }
      }
    }
    return 10 + totalBonus;
  }

  get levelUpCost() {
    if (this.level >= this.maxLevel) return new Decimal(0);
    const stars = this._data.stars || 1;
    const baseCost = new Decimal(10 * Math.pow(stars, 2));
    return baseCost.times(Decimal.pow(2, this.level - 1));
  }

  canLevelUp(cookies) {
    if (this.level >= this.maxLevel) return false;
    return cookies.gte(this.levelUpCost);
  }

  levelUp() {
    if (this.level >= this.maxLevel) return false;
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

  get loadouts() {
    if (!player.companions.loadouts) {
      player.companions.loadouts = Array(8).fill(null).map(() => Array(6).fill(null));
      player.companions.loadoutNames = Array(8).fill("Loadout");
    }
    // Migration: Expand if less than 8
    while (player.companions.loadouts.length < 8) {
      player.companions.loadouts.push(Array(6).fill(null));
      player.companions.loadoutNames.push("Loadout");
    }
    return player.companions.loadouts.map(l => l.map(c => c ? new CompanionState(c) : null));
  },

  get availableEffects() {
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
    return availableEffects;
  },

  get activeLoadoutName() {
    if (!player.companions.activeLoadoutName) player.companions.activeLoadoutName = "Active Loadout";
    return player.companions.activeLoadoutName;
  },

  set activeLoadoutName(value) {
    player.companions.activeLoadoutName = value;
  },

  _cookieHistory: [],
  _lastCookies: null,
  _lastHeldKeys: new Set(),

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
    this.updateKeyboard(diff);

    // Prune history (keep 60s)
    const cutoff = now - 60000;
    // Optimization: Check first element, if old, shift.
    while (this._cookieHistory.length > 0 && this._cookieHistory[0].t < cutoff) {
      this._cookieHistory.shift();
    }

    // Lazy check on update for discovery (could be optimized)
    this.checkDiscovered();

    // Auto Summon
    if (player.companions.autoSummonBasic) {
      this.fullSend("basic", 1); // Limit to 1 per tick for auto to avoid performance spikes
    }
    if (player.companions.autoSummonMighty) {
      this.fullSend("mighty", 1);
    }
  },

  checkDiscovered() {
    if (!player.companions.records.discoveredEffects) {
      player.companions.records.discoveredEffects = [];
    }

    const allCompanions = [
      ...player.companions.active,
      ...player.companions.bank,
      ...player.companions.loadouts.flat()
    ];

    for (const comp of allCompanions) {
      if (!comp) continue;
      for (const effectId of comp.effects) {
        if (!player.companions.records.discoveredEffects.includes(effectId)) {
          player.companions.records.discoveredEffects.push(effectId);
        }
      }
    }
  },

  updateKeyboard(diff) {
    if (!player.companions.virtualKeypad || !player.companions.virtualKeypad.heldKeys.length) return;

    ui.view.isAutomatedHotkey = true;
    const held = new Set(player.companions.virtualKeypad.heldKeys);
    const lastHeld = this._lastHeldKeys;
    const newKeys = [...held].filter(k => !lastHeld.has(k));

    for (const shortcut of shortcuts) {
      if (typeof shortcut.visible === "function" && !shortcut.visible()) continue;
      if (shortcut.visible === false) continue;

      const allHeld = shortcut.keys.every(k => {
        if (k === "mod") return held.has("ctrl") || held.has("meta") || held.has("command");
        return held.has(k.toLowerCase());
      });

      if (allHeld) {
        const isRepeatable = shortcut.type && shortcut.type.toLowerCase().includes("repeatable");

        if (isRepeatable) {
          // Repeatable: Trigger multiple times if diff is large (max 100 to avoid hangs)
          // 40ms is the game's standard repeat rate for physical keys
          const times = Math.clamp(Math.floor(diff / 40), 1, 100);
          for (let i = 0; i < times; i++) {
            shortcut.function();
          }
        } else {
          // Non-repeatable: Only trigger if one of the keys just went "down"
          const anyNew = shortcut.keys.some(k => {
            if (k === "mod") return newKeys.includes("ctrl") || newKeys.includes("meta") || newKeys.includes("command");
            return newKeys.includes(k.toLowerCase());
          });
          if (anyNew) {
            shortcut.function();
          }
        }
      }
    }
    this._lastHeldKeys = held;
    ui.view.isAutomatedHotkey = false;
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
    if (rand < 0.05) stars = 3;
    else if (rand < 0.20) stars = 2;

    // Apply Purer Summons effect
    const bonusChance = this.totalEffect("purer_summons").toNumber();
    if (Math.random() * 100 < bonusChance) {
      stars = Math.min(stars + 1, 6);
    }

    const newComp = this.generateCompanion(stars);

    // Auto Filter Check
    if (this.shouldDelete(newComp) && player.companions.filter && player.companions.filter.auto) {
      return { filtered: true };
    }
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
    if (rand < 0.05) stars = 5;
    else if (rand < 0.20) stars = 4;

    // Apply Purer Summons effect
    const bonusChance = this.totalEffect("purer_summons").toNumber();
    if (Math.random() * 100 < bonusChance) {
      stars = Math.min(stars + 1, 6);
    }

    const newComp = this.generateCompanion(stars);

    // Auto Filter Check
    if (this.shouldDelete(newComp) && player.companions.filter && player.companions.filter.auto) {
      return { filtered: true };
    }

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

  fullSend(tier, limit = 50) {
    let count = 0;
    while (count < limit) {
      const res = tier === "mighty" ? this.summonMighty() : this.summon(tier);
      if (typeof res === "string" || !res || res.filtered === undefined && !(res instanceof CompanionState)) {
        // Error or bank full or can't afford
        break;
      }
      count++;
    }
    return count;
  },

  delete(location, index) {
    if (location === "active") {
      player.companions.active.splice(index, 1, null);
    } else if (location === "bank") {
      player.companions.bank.splice(index, 1, null);
    } else if (location.startsWith("loadout-")) {
      const loadoutIndex = parseInt(location.split("-")[1], 10);
      if (player.companions.loadouts[loadoutIndex]) {
        player.companions.loadouts[loadoutIndex].splice(index, 1, null);
      }
    }
  },

  swapLoadout(loadoutIndex) {
    if (!player.companions.loadouts) return;
    const currentActive = [...player.companions.active];
    const targetLoadout = [...player.companions.loadouts[loadoutIndex]];

    // Swap arrays
    player.companions.active = targetLoadout;
    player.companions.loadouts.splice(loadoutIndex, 1, currentActive);

    // Swap names
    const currentName = this.activeLoadoutName;
    const targetName = player.companions.loadoutNames[loadoutIndex];
    this.activeLoadoutName = targetName;
    player.companions.loadoutNames.splice(loadoutIndex, 1, currentName);
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

  // Filter Logic
  matchesFilter(companion) {
    if (!player.companions.filter) return false;
    const f = player.companions.filter;

    const hasStars = f.stars && f.stars.length > 0;
    const hasEffects = f.effects && f.effects.length > 0;
    const hasTiers = f.tiers && f.tiers.length > 0;

    if (!hasStars && !hasEffects && !hasTiers) return false; // Empty filter matches nothing

    // Check Criteria
    let matchStars = false;
    if (hasStars) {
      matchStars = f.stars.includes(companion.stars);
    }

    let matchEffects = false;
    if (hasEffects) {
      matchEffects = companion.effects.some(effId => f.effects.includes(effId));
    }

    let matchTiers = false;
    if (hasTiers) {
      matchTiers = companion.effects.some(effId => {
        const def = Object.values(CompanionEffects).find(e => e.id === effId);
        if (!def) return false;
        const tier = def.tier || (def.cost || 1);
        // Handle "6+" Logic if needed, but for now assuming direct values.
        // If user selects "6", they mean 6 or higher? Or just 6?
        // Let's assume direct match for 1-5, and maybe 6 handles 6+ if we map it that way.
        // For now simpler: direct match.
        return f.tiers.includes(tier);
      });
    }

    if (f.logic === 'all') {
      // Only check enabled categories
      if (hasStars && !matchStars) return false;
      if (hasEffects && !matchEffects) return false;
      if (hasTiers && !matchTiers) return false;
      return true;
    } else {
      // Any
      if (hasStars && matchStars) return true;
      if (hasEffects && matchEffects) return true;
      if (hasTiers && matchTiers) return true;
      return false;
    }
  },

  shouldDelete(companion) {
    if (!player.companions.filter) return false;
    const f = player.companions.filter;

    // Special safety: Never delete favorites (though new summons aren't favorites yet)
    if (companion.isFavorite) return false;

    const matches = this.matchesFilter(companion);

    if (f.mode === 'blacklist') {
      return matches;
    } else {
      // Whitelist: Delete if it DOES NOT match
      return !matches;
    }
  },

  deleteByFilter() {
    let count = 0;
    const banks = player.companions.bank;

    for (let i = 0; i < banks.length; i++) {
      const comp = banks[i];
      if (comp && this.shouldDelete(comp)) {
        banks.splice(i, 1, null);
        count++;
      }
    }
    return count;
  },

  generateCompanion(stars) {
    // Basic pool (Cost 1)
    const availableEffects = this.availableEffects;

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

    const companion = {
      stars: stars,
      effects: effects,
      level: 1,
      isFavorite: false,
      uuid: Math.floor(Math.random() * 1e9),
      name: this.generateName()
    };

    return companion;
  }
};

window.Companions = Companions;
