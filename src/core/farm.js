
export const DEATH_MESSAGES = {
    common: [
        "Grandma died of old age",
    ],
    rare: [
        "Grandma fell from a high place",
        "Grandma was eaten by a dragon",
        "Grandma tried to swim in lava",
        "Grandma got run over by a truck",
    ],
    veryRare: [
        "Grandma was not ready for the wall of flesh",
        "Grandma was not the imposter",
        "Grandma was the imposter",
        "Grandma watched too much brainrot",
        "Grandma got yeeted into space",
        "Grandma challenged Leo to a 1v1",
        "Grandma got cancelled",
    ]
};

export const Farm = {
    get seeds() {
        return player.farm.seeds;
    },

    get plots() {
        return player.farm.plots;
    },

    craftSeed() {
        if (player.cookies.lt(10)) return false;
        player.cookies = player.cookies.sub(10);
        player.farm.seeds++;
        return true;
    },

    getDeathMessage() {
        const rand = Math.random();
        // 70% Common, 20% Rare, 10% Very Rare
        if (rand < 0.70) {
            return DEATH_MESSAGES.common[Math.floor(Math.random() * DEATH_MESSAGES.common.length)];
        } else if (rand < 0.90) {
            return DEATH_MESSAGES.rare[Math.floor(Math.random() * DEATH_MESSAGES.rare.length)];
        } else {
            return DEATH_MESSAGES.veryRare[Math.floor(Math.random() * DEATH_MESSAGES.veryRare.length)];
        }
    },

    hireGrandma(index) {
        if (player.cookies.lt(20)) return false;
        const plot = player.farm.plots[index];
        // Can only hire on a plot that exists (even if empty? Usually grandmas tend a plot).
        // Let's assume you put a grandma on a plot. She stays there.
        if (!plot) {
            // New plot init
            player.farm.plots[index] = {
                plantTime: 0,
                progress: 0,
                hasCookie: false,
                isRotted: false,
                hasGrandma: true,
                hasTombstone: false,
                cookiesHarvested: 0
            };
        } else {
            // Can handle replacing tombstone
            if (plot.hasTombstone) {
                plot.hasTombstone = false;
            } else if (plot.hasGrandma) {
                return false;
            }

            plot.hasGrandma = true;
            plot.cookiesHarvested = 0;
            // Need trigger?
            const newPlot = { ...plot };
            player.farm.plots.splice(index, 1, newPlot);
        }
        player.cookies = player.cookies.sub(20);
        return true;
    },

    clearPlot(index) {
        const plot = player.farm.plots[index];
        if (!plot) return false;

        // "empty plot" -> removes plant and rot. Does it remove grandma? 
        // "add a button to select a plot to empty"
        // Usually clearing a plot implies removing the plant. 
        // If it's fully empty, we might remove the plot object entirely unless there's a grandma.

        // Reset plant data
        plot.plantTime = 0;
        plot.progress = 0;
        plot.hasCookie = false;
        plot.isRotted = false;
        // Does clear remove tombstone? Yes, "empty plot".
        plot.hasTombstone = false;

        // Ensure reactivity
        player.farm.plots.splice(index, 1, plot);
        return true;
    },

    plant(index) {
        if (player.farm.seeds < 1) return false;

        const existingPlot = player.farm.plots[index];
        // If plot exists and has a grandma, keep her.
        // If plot exists and has a plant (growing/ready), fail? Or overwrite? Fail is safer.
        if (existingPlot) {
            if (existingPlot.plantTime > 0) return false; // Already has plant
            // Only has grandma
            existingPlot.plantTime = Date.now();
            existingPlot.progress = 0;
            existingPlot.hasCookie = false;
        } else {
            player.farm.plots[index] = {
                plantTime: Date.now(),
                progress: 0,
                hasCookie: false,
                isRotted: false,
                hasGrandma: false,
                hasTombstone: false,
                cookiesHarvested: 0
            };
        }

        player.farm.seeds--;
        // Reactivity handled by Vue if we reassign array index, but explicit splice is safest
        player.farm.plots.splice(index, 1, player.farm.plots[index]);
        return true;
    },

    harvest(index) {
        // Shared logic with auto-harvest, but manual is always 100% gain?
        // User didn't specify manual tax. "she will automatically harvest... but take every second cookie".
        // Implies manual harvest is full gain.
        return this.filesHarvest(index, false);
    },

    filesHarvest(index, isGrandma) {
        const plot = player.farm.plots[index];
        if (!plot || !plot.hasCookie) return false;

        let gain = new Decimal(1);
        gain = gain.times(Companions.cookieMultiplier);

        // Grandma Tax
        if (isGrandma) {
            plot.cookiesHarvested = (plot.cookiesHarvested || 0) + 1;

            // Check Upgrade Level
            // Level 0: every 2nd (div 2)
            // Level 1: every 3rd (div 3)
            // ...
            // Level 5: None.
            const dietLevel = Companions.upgradeLevel("grandma_diet");
            let steals = false;

            if (dietLevel < 5) {
                let div = 2 + dietLevel;
                // Special case for level 4 (6 or 7)
                if (dietLevel === 4) {
                    div = Math.random() < 0.5 ? 6 : 7;
                }

                if (plot.cookiesHarvested % div === 0) {
                    steals = true;
                }
            }

            if (steals) {
                // Grandma keeps it.
                gain = new Decimal(0);
            }

            // Grandma Death Logic (Scaled by Upgrade)
            const lifeLevel = Companions.upgradeLevel("grandma_life");
            const deathChance = 0.01 * (1 - (0.2 * lifeLevel));

            if (Math.random() < deathChance) {
                plot.hasGrandma = false;
                plot.hasTombstone = true;
                plot.cookiesHarvested = 0;
                GameUI.notify.error(this.getDeathMessage() + "!");
            }
        }

        if (gain.gt(0)) {
            player.cookies = player.cookies.add(gain);
        }

        // Rot Logic
        // "seeds have a 1% chance to rot when harvested, making it disappear."
        // "leaving an empty plot or rather a rotted icon that can be clicked to remove it."
        const rotLevel = Companions.upgradeLevel("seed_rot");
        const rotChance = 0.01 * (1 - (0.2 * rotLevel));

        if (Math.random() < rotChance) {
            // Rot!
            plot.hasCookie = false;
            plot.isRotted = true;
            plot.progress = 0;
            GameUI.notify.error("Seed rotted away!");
        } else {
            // Harvest Successful
            // User request: "seeds should stay... until they are rotten"
            // So we keep the plant for next cycle.
            // Reset for next growth cycle
            plot.plantTime = Date.now();
            plot.progress = 0;
            plot.hasCookie = false;
            plot.isRotted = false;
            // Grandma stays (if she didn't die)
        }

        const newPlot = { ...plot };
        player.farm.plots.splice(index, 1, newPlot);

        return true;
    },

    update(diff) {
        const now = Date.now();
        for (let i = 0; i < player.farm.plots.length; i++) {
            const plot = player.farm.plots[i];
            if (plot && !plot.hasCookie && !plot.isRotted && plot.plantTime > 0) {
                // Base 10000ms.
                // Apply Dino Seed Speed effect
                // Effect value = Percent per Score. (e.g. 1% per score)
                // Speed Mult = 1 + (Value * Score) / 100
                const effectPerScore = Companions.totalEffect("dino_seed_speed").toNumber(); // e.g. 1
                const score = player.companions.minigameScore || 0;
                let speedMult = 1 + (effectPerScore * score) / 100;

                // Tickspeed Upgrade Effect
                if (Companions.upgradeLevel("tickspeed_seed_growth") > 0) {
                    const tickUpgrades = Tickspeed.totalUpgrades;
                    speedMult *= Math.pow(1.001, tickUpgrades);
                }

                // Effective Time += diff * speedMult
                // We stored plantTime. We need to track progress instead of just subtracting dates if speed varies.
                // Current logic: now - plot.plantTime >= 10000.
                // If we want variable speed, we must migrate to a progress-based system.
                // Or simply: update plantTime to be "effective start time"?
                // Easier: plot.accumulatedTime += diff * speedMult.

                // MIGRATION: We need to change how plot stores progress.
                // Currently: plantTime.
                // Let's change to: plot.progress (0 to 10000).

                // If plot.progress doesn't exist, init it based on (now - plantTime)
                if (plot.progress === undefined) {
                    plot.progress = Math.max(0, now - plot.plantTime);
                }

                plot.progress += diff * speedMult;

                if (plot.progress >= 10000) {
                    plot.hasCookie = true;
                    plot.progress = 0; // Reset for next cycle
                    // Trigger reactivity
                    player.farm.plots.splice(i, 1, plot);
                }
            }

            // Check for Grandma Auto-Harvest
            // She harvests immediately when it's ready?
            // "she will automaticially harvest cookies from that space"
            if (plot && plot.hasGrandma && plot.hasCookie) {
                this.filesHarvest(i, true);
            }
        }
    }
};

window.Farm = Farm;
