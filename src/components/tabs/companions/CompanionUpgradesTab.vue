<script>
import PrimaryButton from "@/components/PrimaryButton";
import { Companions, CompanionUpgrades } from "@/core/companions";

export default {
  name: "CompanionUpgradesTab",
  components: {
    PrimaryButton
  },
  data() {
    return {
      cookies: new Decimal(0),
      upgrades: []
    };
  },
  computed: {
    formatCookies() {
      return format(this.cookies, 2);
    }
  },
  methods: {
    update() {
      this.cookies.copyFrom(player.cookies);
      
      this.upgrades = Object.values(CompanionUpgrades).map(u => {
          const cost = Companions.upgradeCost(u.id);
          return {
              def: u,
              id: u.id,
              level: Companions.upgradeLevel(u.id),
              cost: cost,
              canAfford: cost && this.cookies.gte(cost),
              isMaxed: cost === null
          };
      });
    },
    buy(id) {
        if (Companions.buyUpgrade(id)) {
            // Sound or feedback?
        }
    },
    formatCost(cost) {
        if (!cost) return "";
        return format(cost, 2, 0);
    }
  }
};
</script>

<template>
  <div class="l-companion-upgrades-tab">
    <div class="c-cookies-header">
       You have <span class="c-cookies-amount">{{ formatCookies }}</span> Cookies
    </div>

    <div class="l-upgrades-grid">
        <button 
            v-for="u in upgrades" 
            :key="u.id"
            class="c-upgrade-btn"
            :class="{ 
                'c-upgrade-btn--bought': u.isMaxed,
                'c-upgrade-btn--available': !u.isMaxed && u.canAfford,
                'c-upgrade-btn--unavailable': !u.isMaxed && !u.canAfford
            }"
            @click="buy(u.id)"
        >
            <div class="c-upgrade-header">{{ u.def.name }}</div>
            <div class="c-upgrade-desc">{{ u.def.description }}</div>
            <div class="c-upgrade-effect">
                Effect: <span class="c-effect-highlight">{{ u.def.formatEffect(u.level) }}</span>
                <span v-if="!u.isMaxed && u.def.maxLevel > 1" class="c-next-effect">
                    ➜ {{ u.def.formatEffect(u.level + 1) }}
                </span>
            </div>
            
            <div class="c-upgrade-footer">
                <div v-if="u.isMaxed">MAX LEVEL</div>
                <div v-else>
                    Cost: {{ formatCost(u.cost) }} Cookies
                </div>
                <div class="c-upgrade-level">Lvl {{ u.level }} / {{ u.def.maxLevel }}</div>
            </div>
        </button>
        
        <!-- Fillers to complete 3x3 look if fewer than 9 upgrades -->
        <div v-for="i in (9 - upgrades.length)" :key="'empty-'+i" class="c-upgrade-btn c-upgrade-btn--empty">
            <span class="c-empty-text">Coming Soon...</span>
        </div>
    </div>
  </div>
</template>

<style scoped>
.l-companion-upgrades-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: var(--color-text);
}

.c-cookies-header {
    font-size: 1.5rem;
    margin-bottom: 2rem;
}

.c-cookies-amount {
    color: #d2691e;
    font-weight: bold;
}

.l-upgrades-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 1rem;
    width: 900px;
    height: 600px; /* Force square-ish aspect */
}

.c-upgrade-btn {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border: 2px solid;
    border-radius: 4px;
    background-color: black;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    font-family: Typewriter, serif;
    position: relative;
    user-select: none;
}

.c-upgrade-btn--empty {
    border-color: #333;
    opacity: 0.5;
    cursor: default;
    background: transparent;
    justify-content: center;
}

.c-upgrade-btn--available {
    border-color: var(--color-antimatter);
    color: var(--color-antimatter);
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.c-upgrade-btn--available:hover {
    background-color: var(--color-antimatter);
    color: black;
    box-shadow: 0 0 20px var(--color-antimatter);
}

.c-upgrade-btn--unavailable {
    border-color: #555;
    color: #555;
    cursor: not-allowed;
}

.c-upgrade-btn--bought {
    border-color: var(--color-infinity);
    background-color: var(--color-infinity);
    color: black;
    cursor: default;
}

.c-upgrade-header {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.c-upgrade-desc {
    font-size: 0.9rem;
    flex-grow: 1;
}

.c-upgrade-effect {
    font-size: 0.8rem;
    margin: 0.5rem 0;
    color: inherit;
}

.c-effect-highlight {
    font-weight: bold;
}

.c-next-effect {
    opacity: 0.8;
    display: block;
    margin-top: 0.2rem;
}

.c-upgrade-footer {
    width: 100%;
    border-top: 1px solid currentColor;
    padding-top: 0.5rem;
    font-weight: bold;
}

.c-upgrade-level {
    font-size: 0.8rem;
    margin-top: 0.2rem;
    opacity: 0.8;
}

/* Override hover text color for effect highlight when available */
.c-upgrade-btn--available:hover .c-effect-highlight {
    color: black; /* Usually covered by inherit, but ensuring */
}
</style>
