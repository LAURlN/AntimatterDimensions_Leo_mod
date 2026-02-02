<template>
  <div class="c-farming-tab">
    <div class="c-farming-header">
      <h2>Cookie Farm</h2>
      <div class="c-farming-resources">
        <div class="c-resource-item">
            <span class="c-resource-label">Cookies:</span>
            <span class="c-resource-value">{{ formatInt(cookies) }}</span>
        </div>
        <div class="c-resource-item">
            <span class="c-resource-label">Seeds:</span>
            <span class="c-resource-value">{{ formatInt(seeds) }}</span>
        </div>
      </div>
      
      <div class="c-farming-controls">
          <PrimaryButton
            class="o-primary-btn--subtab-option"
            @click="craftSeed"
            :enabled="cookies.gte(10)"
          >
            Craft Seed (10 Cookies)
          </PrimaryButton>

          <div class="c-mode-controls">
              <PrimaryButton 
                class="o-primary-btn--subtab-option"
                :class="{ 'o-primary-btn--active': interactionMode === 'planting' }"
                @click="setMode('planting')"
              >
                  Plant Mode {{ interactionMode === 'planting' ? '(Active)' : '' }}
              </PrimaryButton>
              <PrimaryButton 
                class="o-primary-btn--subtab-option"
                :class="{ 'o-primary-btn--active': interactionMode === 'hiring' }"
                @click="setMode('hiring')"
                :enabled="cookies.gte(100)"
              >
                  Hire Grandma (100 Cookies) {{ interactionMode === 'hiring' ? '(Active)' : '' }}
              </PrimaryButton>
              <PrimaryButton 
                class="o-primary-btn--subtab-option"
                :class="{ 'o-primary-btn--active': interactionMode === 'clearing' }"
                @click="setMode('clearing')"
              >
                  Clear Plot {{ interactionMode === 'clearing' ? '(Active)' : '' }}
              </PrimaryButton>
          </div>
          <div class="c-instruction-container">
            <div v-if="interactionMode !== 'none'" class="c-instruction-text">
                {{ getInstructionText() }}
                <button class="c-cancel-btn" @click="setMode('none')">Cancel</button>
            </div>
          </div>
      </div>
    </div>

    <div class="l-farm-grid">
      <div 
        v-for="(plot, index) in plots" 
        :key="index"
        class="c-farm-plot"

        :class="{ 
            'c-farm-plot--empty': !plot || (plot && plot.plantTime === 0 && !plot.isRotted), 
            'c-farm-plot--growing': plot && plot.plantTime > 0 && !plot.hasCookie && !plot.isRotted,
            'c-farm-plot--ready': plot && plot.hasCookie,
            'c-farm-plot--rotted': plot && plot.isRotted,
            'c-farm-plot--has-grandma': plot && plot.hasGrandma,
            'c-farm-plot--tombstone': plot && plot.hasTombstone,
            'c-farm-plot--interactive': getInteractionClass(plot)
        }"
        @click="handlePlotClick(index)"
      >
        <div class="c-plot-content">
            <span v-if="!plot" class="c-plot-icon">🟫</span>
            <span v-else-if="plot.isRotted" class="c-plot-icon c-plot-icon--rotted">🍂</span>
            <span v-else-if="!plot.hasCookie" class="c-plot-icon c-plot-icon--growing">🌱</span>
            <span v-else class="c-plot-icon c-plot-icon--ready">🍪</span>
        </div>
        <div class="c-plot-status">
            {{ getPlotStatus(plot) }}
        </div>
        <div v-if="plot && plot.hasGrandma" class="c-grandma-overlay">👵</div>
        <div v-if="plot && plot.hasTombstone" class="c-grandma-overlay">🪦</div>
      </div>
    </div>
  </div>
</template>

<script>
import PrimaryButton from "@/components/PrimaryButton";

export default {
  name: "CookieFarmTab",
  components: {
    PrimaryButton
  },
  data() {
    return {
      cookies: new Decimal(0),
      seeds: 0,
      plots: [],
      // Update timer to refresh UI for growth progress
      timer: null,
      interactionMode: 'none', // 'none', 'planting', 'hiring', 'clearing'
    };
  },
  methods: {
    update() {
      this.cookies = player.cookies;
      this.seeds = player.farm.seeds;
      this.plots = player.farm.plots.map(p => p ? { ...p } : null); 
    },
    formatInt(x) {
        return formatInt(x);
    },
    craftSeed() {
        Farm.craftSeed();
    },
    setMode(mode) {
        if (this.interactionMode === mode) {
            this.interactionMode = 'none';
        } else {
            this.interactionMode = mode;
        }
    },
    getInstructionText() {
        if (this.interactionMode === 'planting') return "Select an empty plot to plant a seed.";
        if (this.interactionMode === 'hiring') return "Select a plot to place a Grandma.";
        if (this.interactionMode === 'clearing') return "Select a plot to empty it (removes seed/rot/tombstone).";
        return "";
    },
    getInteractionClass(plot) {
        if (this.interactionMode === 'planting') {
            // Can plant if plot is empty OR (has grandma but no plant)
            // Cannot plant on tombstone? Probably not, must clear/hire first? Or just ignore tombstone?
            // "when she dies it should be replaced with a tombstone until a new one is hired there."
            // Implies Tombstone blocks things? Or just visual?
            // Let's assume planting on a tombstone is weird. Block it.
            const hasPlant = plot && (plot.plantTime > 0 || plot.isRotted || plot.hasTombstone);
            return !hasPlant && this.seeds > 0;
        }
        if (this.interactionMode === 'hiring') {
            // Can hire on empty, or tombstone.
            const hasGrandma = plot && plot.hasGrandma;
            // Tombstone doesn't count as grandma, so we can hire there.
            return !hasGrandma && this.cookies.gte(100);
        }
        if (this.interactionMode === 'clearing') {
            return plot && (plot.plantTime > 0 || plot.isRotted || plot.hasTombstone);
        }
        // Interaction for removing rot/tombstone if no mode?
        if (plot && (plot.isRotted || plot.hasTombstone)) return true;
        
        return false;
    },
    handlePlotClick(index) {
        const plot = this.plots[index];
        
        // Priority: Rot/Tombstone clearing
        if (plot && (plot.isRotted || plot.hasTombstone) && this.interactionMode === 'none') {
            // If it's a tombstone, maybe we want to hire instead of clear?
            // But if user clicks it, clearing is safe.
            Farm.clearPlot(index);
            GameUI.notify.info("Cleared plot.");
            return;
        }

        if (this.interactionMode === 'clearing') {
             if (Farm.clearPlot(index)) {
                 GameUI.notify.success("Plot cleared!");
             }
             return;
        }
        if (this.interactionMode === 'planting') {
            if (Farm.plant(index)) {
                GameUI.notify.success("Planted!");
                // Keep mode active or reset? User usually wants to spam plant.
                // "plant seed button and then select the space" -> Singular?
                // But usually easier to keep active. Let's keep active.
            } else {
                 if (this.seeds === 0) GameUI.notify.error("No seeds!");
                 else GameUI.notify.error("Cannot plant here!");
            }
            return;
        }

        if (this.interactionMode === 'hiring') {
            if (Farm.hireGrandma(index)) {
                GameUI.notify.success("Grandma Hired!");
                this.interactionMode = 'none'; // Hire is usually one-off/expensive
            } else {
                 if (this.cookies.lt(100)) GameUI.notify.error("Not enough cookies!");
                 else GameUI.notify.error("Grandma already here!");
            }
            return;
        }

        // Default interaction: Harvest
        if (plot && plot.hasCookie) {
            Farm.harvest(index);
        }
    },
    getPlotStatus(plot) {
        if (!plot) return "Empty";
        if (plot.hasTombstone) return "RIP";
        if (plot.hasGrandma) {
             if (plot.plantTime === 0) return "Waiting for Seed...";
        }
        if (plot.isRotted) return "Rotted!";
        if (plot.plantTime === 0) return "Empty";
        if (plot.hasCookie) return "Ready!";
        return "Growing...";
    }
  },
  mounted() {
      // Force update often for smooth feel if we want progress bars, but for now 5s is slow.
      // Simple text update is fine.
  }
};
</script>

<style scoped>
.c-farming-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.c-farming-header {
    margin-bottom: 2rem;
    text-align: center;
}

.c-farming-resources {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin: 1rem 0;
    font-size: 1.2rem;
}

.c-resource-label {
    color: var(--color-text);
}

.c-resource-value {
    color: var(--color-accent);
    font-weight: bold;
    margin-left: 0.5rem;
}

.l-farm-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    background: var(--color-base);
    padding: 1rem;
    border: 1px solid var(--color-accent);
    border-radius: var(--border-radius);
}

.c-farm-plot {
    width: 80px;
    height: 80px;
    background-color: #3e2723; /* Dark soil */
    border: 2px solid #5d4037;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.1s;
    user-select: none;
    position: relative; /* Ensure absolute children (overlays) are positioned relative to this */
}

.c-farm-plot:hover {
    transform: scale(1.05);
    filter: brightness(1.2);
}

.c-farm-plot--empty {
    opacity: 0.7;
}

.c-farm-plot--empty.c-farm-plot--has-grandma,
.c-farm-plot--empty.c-farm-plot--tombstone {
    opacity: 1;
    background-color: #5d4037; /* Slightly lighter/different to show it's occupied by grandma waiting */
}

.c-farm-plot--growing {
    border-color: #8bc34a;
}

.c-farm-plot--ready {
    border-color: #ff9800;
    box-shadow: 0 0 10px #ff9800;
}

.c-farm-plot--rotted {
    border-color: #795548;
    background-color: #2b1d19;
}

.c-plot-icon {
    font-size: 2rem;
}

.c-plot-icon--growing {
    animation: grow 2s infinite alternate;
}

.c-plot-status {
    font-size: 0.7rem;
    margin-top: 0.2rem;
    color: rgba(255, 255, 255, 0.7);
}

@keyframes grow {
    from { transform: scale(0.8); }
    to { transform: scale(1.1); }
}

.c-farming-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.c-mode-controls {
    display: flex;
    gap: 1rem;
}

.o-primary-btn--active {
    background-color: var(--color-accent);
    color: black;
    border-color: white;
}

.c-instruction-text {
    font-style: italic;
    color: var(--color-text);
    display: flex;
    gap: 1rem;
    align-items: center;
}

.c-cancel-btn {
    background: none;
    border: 1px solid var(--color-text);
    color: var(--color-text);
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
}

.c-farm-plot--interactive:hover {
    box-shadow: 0 0 15px white;
    cursor: crosshair;
}

.c-grandma-overlay {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 2rem;
    filter: drop-shadow(0 0 2px black);
    z-index: 5;
    opacity: 1;
}

.c-instruction-container {
    height: 30px; /* Fixed height to prevent shifting */
    display: flex;
    justify-content: center;
    align-items: center;
}

.c-plot-content {
    position: relative;
    /* Ensure content is centered but allows overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
</style>
