<script>
import PrimaryButton from "@/components/PrimaryButton";

import { Companions, CompanionEffects, CompanionState } from "@/core/companions";

export default {
  name: "CompanionsTab",
  components: {
    PrimaryButton
  },
  data() {
    return {
      activeSlots: [],
      bankSlots: [],
      bankSlots: [],
      // Multi-select support
      selectedSlots: [], // Array of { location, index }
      selectedCompanion: null,
      cookies: new Decimal(0),
      isDeleting: false,
      isBulkDeleting: false,
    };
  },
  computed: {
    formatCookies() {
      return format(this.cookies, 2);
    },
    activeEffects() {
      // Explicit dependency on activeSlots to ensure reactivity
      this.activeSlots;
      return Object.values(CompanionEffects)
        .map(def => {
          const value = Companions.totalEffect(def.id);
          const isActive = def.scaling === "pow" ? value.gt(1) : value.gt(0);
          const formatter = def.summaryFormat || def.format;
          return {
            id: def.id,
            isActive,
            displayText: formatter(value)
          };
        })
        .filter(eff => eff.isActive);
    }
  },
  methods: {
    update() {
      // Sync with global state
      // We map to new objects to ensure Vue detects changes if the reference allows, 
      // but strictly deep watching might be needed if objects mutate in place.
      // For now, mapping creates fresh wrappers for the view.
      
      // We need to preserve the "null" slots visually.
      this.activeSlots = Companions.active;
      this.bankSlots = Companions.bank;
      this.cookies.copyFrom(player.cookies);
    },
    summonBasic() {
      const result = Companions.summon("basic");
      if (typeof result === "string") {
        GameUI.notify.error(result);
      } else if (result) {
        GameUI.notify.success("Summoned a Companion!");
      } else {
        GameUI.notify.error("Not enough cookies!");
      }
    },
    summonMighty() {
      const result = Companions.summonMighty();
      if (typeof result === "string") {
        GameUI.notify.error(result);
      } else if (result) {
        GameUI.notify.success("Summoned a Mighty Companion!");
      } else {
        GameUI.notify.error("Not enough cookies!");
      }
    },
    handleSlotClick(location, index, event) {
      // Toggle selection if Ctrl is held
      if (event && event.ctrlKey) {
          this.toggleSelection(location, index);
          return;
      }
    
      // Normal single selection behavior
      
      // Check if we should move/swap BEFORE clearing selection
      if (this.selectedSlots.length === 1 && (this.selectedSlots[0].location !== location || this.selectedSlots[0].index !== index)) {
          // Attempt swap or move
          const prev = this.selectedSlots[0];
          const originList = prev.location === 'active' ? player.companions.active : player.companions.bank;
          const targetList = location === 'active' ? player.companions.active : player.companions.bank;
          
          const originItem = originList[prev.index];
          const targetItem = targetList[index];

          // If target is empty -> MOVE
          if (!targetItem && originItem) {
               originList[prev.index] = null; // Move leaves hole
               targetList[index] = originItem;
               
               // Keep selection on the new slot (follow the unit)
               this.selectedSlots = [{ location, index }];
               this.updateSelectedCompanion();
               this.isDeleting = false;
               return;
          }
          
          // If target is occupied -> SELECT NEW (Do not swap)
          // User asked: "when one companion is selected and you click on a different one, the new one should be immediately selected."
      }

      // New single selection behavior (handles occupied click or new selection)
      // Deselect all others first if not Ctrl
      this.selectedSlots = [{ location, index }];
      this.updateSelectedCompanion();
      this.isDeleting = false;
    },
    toggleSelection(location, index) {
        // Check if exists
        const existingIdx = this.selectedSlots.findIndex(s => s.location === location && s.index === index);
        if (existingIdx !== -1) {
            this.selectedSlots.splice(existingIdx, 1);
        } else {
            this.selectedSlots.push({ location, index });
        }
        this.updateSelectedCompanion();
        this.isDeleting = false;
    },
    isSelected(location, index) {
      return this.selectedSlots.some(s => s.location === location && s.index === index);
    },
    updateSelectedCompanion() {
      if (this.selectedSlots.length === 1) {
        const slot = this.selectedSlots[0];
        const list = slot.location === 'active' ? player.companions.active : player.companions.bank;
        const comp = list[slot.index];
        if (comp) {
            this.selectedCompanion = new CompanionState(comp);
            if (!this.selectedCompanion.name) this.selectedCompanion.name = "Unknown";
        } else {
            this.selectedCompanion = null; // Empty slot selected
        }
      } else {
          this.selectedCompanion = null; // Multiple or none
      }
    },
    toggleFavorite() {
        if (!this.selectedSlots.length || this.selectedSlots.length > 1) return;
        const slot = this.selectedSlots[0];
        const list = slot.location === 'active' ? player.companions.active : player.companions.bank;
        const comp = list[slot.index];
        if (comp) {
            comp.isFavorite = !comp.isFavorite;
            this.updateSelectedCompanion(); // Refresh
        }
    },
    levelUpSelected() {
        if (!this.selectedSlots.length || this.selectedSlots.length > 1) return;
        const slot = this.selectedSlots[0];
        const list = slot.location === 'active' ? player.companions.active : player.companions.bank;
        const compData = list[slot.index];
        if (compData) {
            const compState = new CompanionState(compData);
            if (compState.canLevelUp(player.cookies)) {
                player.cookies = player.cookies.sub(compState.levelUpCost);
                compState.levelUp(); // Updates local state
                
                // Write back level to data (since State wraps data, level setter should handle it, checking implementation)
                // My implementation of level setter updates _data.level. Does keys match?
                // Yes, I verified State wraps and updates _data.
                
                this.updateSelectedCompanion(); 
                GameUI.notify.success(`Leveled up to ${compState.level}!`);
            }
        }
    },
    deleteSelected() {
        if (!this.selectedSlots.length) return;
        
        // Safety check for favorites
        // Actually `Companions.delete` doesn't check favorite. We should check here?
        // Or assume manual delete overrides favorite? 
        // Let's protect favorites unless explicitly unchecked? 
        // Or just let delete delete.
        // Ideally: Manual delete overrides favorite.
        
        // Sort indices descending to keep stability if same array? 
        // We use direct index access so order doesn't matter unless we splice remove.
        
        for (const slot of this.selectedSlots) {
             Companions.delete(slot.location, slot.index);
        }
        this.selectedSlots = [];
        this.selectedCompanion = null;
        this.isDeleting = false;
    },
    deleteAllNonFavorite() {
        if (!this.isBulkDeleting) {
            this.isBulkDeleting = true;
            return;
        }
        const count = Companions.deleteAllNonFavorite();
        GameUI.notify.success(`Deleted ${count} non-favorite companions.`);
        this.isBulkDeleting = false;
        // Refresh selection if they were deleted
        this.selectedSlots = [];
        this.selectedCompanion = null;
    },
    renameSelected(event) {
      const newName = event.target.value;
      if (this.selectedSlots.length !== 1) return;
      
      const slot = this.selectedSlots[0];
      const list = slot.location === 'active' ? player.companions.active : player.companions.bank;
      if (list[slot.index]) {
        list[slot.index].name = newName;
      }
    },
    handleDelete() {
        if (!this.selectedSlots.length) return;
        
        if (!this.isDeleting) {
            this.isDeleting = true;
            return;
        }

        this.deleteSelected();
        this.isDeleting = false;
    },
    getCompanionSymbol(companion) {
      if (!companion) return "";
      return this.hasFavorite(companion) ? "♥" : "★";
    },
    getSymbolPositions(count) {
      if (count <= 1) return [{ x: 0, y: 0 }];
      
      const positions = [];
      const radius = 20; // Radius of the circle in px
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        positions.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        });
      }
      return positions;
    },
    getCompanionTooltip(companion) {
      if (!companion) return "";
      
      const counts = {};
      for (const effId of companion.effects) {
        counts[effId] = (counts[effId] || 0) + 1;
      }
      
      const effectsList = Object.entries(counts).map(([id, count]) => {
         const def = Object.values(CompanionEffects).find(e => e.id === id);
         
         // Tier Color Logic
         const effectiveTier = (def.tier || 1) + (count - 1);
         const color = this.getTierColor(effectiveTier);

         // Calculate value for this specific tier/count to show in tooltip
         let effectValue = def.baseValue;
         const level = companion.level || 1;

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

         let val = 0;
         if (def.scaling === "pow") {
            val = Math.pow(effectValue, count);
         } else {
            val = effectValue * count;
         }
         
         // Motherlode Bonus
         if (companion.name && companion.name.toLowerCase() === "motherlode") {
             val *= 10;
         }

         return def ? `<br>• <span style="color: ${color}; font-weight: bold; text-shadow: 0 0 5px ${color};">${def.format(val)}</span>` : id;
      }).join("");

      const symbol = this.getCompanionSymbol(companion);
      return `<div style="text-align: center;">
        <b style="font-size: 1.2em; color: var(--color-accent);">${companion.name || 'Companion'}</b><br>
        <span style="font-size: 0.9em; color: white;">Level ${companion.level || 1}</span><br>
        <span style="font-size: 0.9em; color: ${this.hasFavorite(companion) ? '#e91e63' : 'gold'};">${symbol.repeat(companion.stars)}</span>
        <div style="margin-top: 0.5rem; text-align: left;">
          ${effectsList}
        </div>
      </div>`;
    },
    hasFavorite(companion) {
        return companion && (companion.isFavorite || companion._data.isFavorite);
    },
    getTierColor(tier) {
      if (tier <= 1) return "white";
      if (tier === 2) return "#4caf50"; // Green
      if (tier === 3) return "#2196f3"; // Blue
      if (tier === 4) return "#9c27b0"; // Purple
      return "#ffd700"; // Gold (5+)
    },
    getCompanionColor(companion) {
      if (!companion) return "white";
      
      const counts = {};
      for (const effId of companion.effects) {
        counts[effId] = (counts[effId] || 0) + 1;
      }
      
      let maxTier = 1;
      for (const [id, count] of Object.entries(counts)) {
        const def = Object.values(CompanionEffects).find(e => e.id === id);
        if (def) {
          const effectiveTier = (def.tier || 1) + (count - 1);
          if (effectiveTier > maxTier) maxTier = effectiveTier;
        }
      }
      
      return this.getTierColor(maxTier);
    },
    handleBackgroundClick(e) {
        // Ignore clicks on interactive elements
        if (e.target.closest('.c-companion-slot') || 
            e.target.closest('button') || 
            e.target.closest('input') ||
            e.target.closest('.c-selected-info')) { // Keep selection if clicking inside the panel
            return;
        }
        
        this.selectedSlots = [];
        this.updateSelectedCompanion();
        this.isDeleting = false;
        this.isBulkDeleting = false;
    }
  }
};
</script>

<template>
  <div class="l-companions-tab" @click="handleBackgroundClick">
    <div class="c-summon-area">
      <div class="c-cookies-display">
        Current Cookies: <span class="c-cookies-amount">{{ formatCookies }}</span>
      </div>
      <div class="c-summon-controls">
        <PrimaryButton 
            class="o-primary-btn--subtab-option"
            @click="summonBasic"
            :enabled="cookies.gte(10)"
        >
            Summon Basic (10 Cookies)
        </PrimaryButton>
        <PrimaryButton 
            class="o-primary-btn--subtab-option c-summon-btn--mighty"
            @click="summonMighty"
            :enabled="cookies.gte(10000)"
        >
            Summon Mighty (10k Cookies)
        </PrimaryButton>
      </div>
      <div class="c-selected-companion-container">

        <div v-if="selectedCompanion" class="c-selected-companion-panel">
          <h3 class="c-selected-header">Selected Companion</h3>
          <div class="c-selected-info">
              <div 
                class="c-selected-symbol" 
                :class="{'c-selected-symbol--fav': hasFavorite(selectedCompanion)}"
                :style="{ color: getCompanionColor(selectedCompanion), textShadow: '0 0 10px ' + getCompanionColor(selectedCompanion) }"
              >
                  <span 
                    v-for="(pos, i) in getSymbolPositions(selectedCompanion.stars)" 
                    :key="i"
                    class="c-companion-symbol-individual"
                    :style="{ transform: `translate(${pos.x * 1.5}px, ${pos.y * 1.5}px)` }"
                  >
                    {{ getCompanionSymbol(selectedCompanion) }}
                  </span>
              </div>
              <div class="c-selected-details">
                  <input 
                      class="c-name-input" 
                      :value="selectedCompanion.name" 
                      @input="renameSelected"
                      placeholder="Rename Companion"
                  />
                  <div class="c-selected-effects" v-html="getCompanionTooltip(selectedCompanion)"></div>
                  
                  <div class="c-selected-actions">
                      <button class="o-primary-btn--subtab-option" @click="toggleFavorite">
                          {{ hasFavorite(selectedCompanion) ? "Unfavorite" : "Mark as Favorite" }}
                      </button>
                      
                      {{ hasFavorite(selectedCompanion) ? "Unfavorite" : "Mark as Favorite" }}
                      </button>

                      <PrimaryButton 
                        v-if="selectedCompanion.level < 10"
                        class="o-primary-btn--subtab-option"
                        :enabled="cookies.gte(selectedCompanion.levelUpCost)"
                        @click="levelUpSelected"
                      >
                        Level Up ({{ format(selectedCompanion.levelUpCost, 2, 0) }} Cookies)
                      </PrimaryButton>
                      <PrimaryButton 
                        v-else
                        class="o-primary-btn--subtab-option o-primary-btn--disabled"
                        :enabled="false"
                      >
                        Max Level
                      </PrimaryButton>
                      
                      <PrimaryButton 
                        class="o-primary-btn--delete"
                        :class="{ 'o-primary-btn--delete-confirm': isDeleting }"
                        @click="handleDelete"
                      >
                        {{ isDeleting ? "Confirm Delete?" : "Delete Companion" }}
                      </PrimaryButton>
                  </div>
              </div>
          </div>
        </div>
        <div v-else-if="selectedSlots.length > 1" class="c-selected-companion-panel">
            <h3 class="c-selected-header">{{ selectedSlots.length }} Companions Selected</h3>
            
            <PrimaryButton 
                class="o-primary-btn--delete"
                :class="{ 'o-primary-btn--delete-confirm': isDeleting }"
                @click="handleDelete"
            >
                {{ isDeleting ? "Confirm Delete All?" : `Delete ${selectedSlots.length} Selected` }}
            </PrimaryButton>
        </div>
        <div v-else class="c-selected-companion-panel c-selected-companion-panel--placeholder">
            <h3 class="c-selected-header">Select a Companion</h3>
            
            <PrimaryButton 
                class="o-primary-btn--delete o-primary-btn--bulk-junk"
                :class="{ 'o-primary-btn--delete-confirm': isBulkDeleting }"
                @click="deleteAllNonFavorite"
                :enabled="true"
                style="margin-top: 2rem;"
            >
                {{ isBulkDeleting ? "Confirm Delete ALL??" : "Delete All Non-Favorite (Bank)" }}
            </PrimaryButton>
        </div>
        
        <div class="c-instruction-text" style="margin-top: 3rem;">
            <span>Click to select. <span style="color: var(--color-accent)">Ctrl + Click</span> to select multiple.</span>
            <span style="font-size: 0.8em; opacity: 0.7;">Click background to deselect.</span>
        </div>
      </div>
    </div>

    <h2 class="c-companions-header">Active Companions (3x2)</h2>
    <div class="l-active-grid">
      <div 
        v-for="(companion, i) in activeSlots" 
        :key="'active-' + i" 
        class="c-companion-slot c-companion-slot--active"
        :class="{ 'c-companion-slot--selected': isSelected('active', i), 'c-companion-slot--fav': hasFavorite(companion) }"
        :style="{ borderColor: getCompanionColor(companion) }"
        @click="handleSlotClick('active', i, $event)"
        v-tooltip="getCompanionTooltip(companion)"
      >
        <div v-if="companion" class="c-companion-content" :style="{ background: 'radial-gradient(circle, ' + getCompanionColor(companion) + ' 0%, rgba(0,0,0,0) 80%)' }">
          <span 
            v-for="(pos, j) in getSymbolPositions(companion.stars)" 
            :key="j"
            class="c-companion-symbol-individual"
            :style="{ transform: `translate(${pos.x}px, ${pos.y}px)` }"
          >
            {{ getCompanionSymbol(companion) }}
          </span>
        </div>
        <span v-else class="c-slot-id">{{ i + 1 }}</span>
      </div>
    </div>

    <div v-if="activeEffects.length > 0" class="c-total-effects-summary">
      <div class="c-total-effects-header">Total Active Effects</div>
      <div class="c-total-effects-list">
        <div v-for="eff in activeEffects" :key="eff.id" class="c-total-effect-item">
          • {{ eff.displayText }}
        </div>
      </div>
    </div>

    <h2 class="c-companions-header">Companion Bank (10x5)</h2>
    <div class="l-bank-grid">
      <div 
        v-for="(companion, i) in bankSlots" 
        :key="'bank-' + i" 
        class="c-companion-slot c-companion-slot--bank"
        :class="{ 'c-companion-slot--selected': isSelected('bank', i), 'c-companion-slot--fav': hasFavorite(companion) }"
        :style="{ borderColor: getCompanionColor(companion) }"
        @click="handleSlotClick('bank', i, $event)"
        v-tooltip="getCompanionTooltip(companion)"
      >
        <div v-if="companion" class="c-companion-content" :style="{ background: 'radial-gradient(circle, ' + getCompanionColor(companion) + ' 0%, rgba(0,0,0,0) 80%)' }">
          <span 
            v-for="(pos, j) in getSymbolPositions(companion.stars)" 
            :key="j"
            class="c-companion-symbol-individual"
            :style="{ transform: `translate(${pos.x * 0.7}px, ${pos.y * 0.7}px)` }"
          >
            {{ getCompanionSymbol(companion) }}
          </span>
        </div>
        <span v-else class="c-slot-id">{{ i + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.l-companions-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text);
  padding: 2rem;
  width: 100%;
  overflow-y: auto;
}

.c-summon-area {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-accent);
  border-radius: 5px;
  background: rgba(0,0,0,0.2);
}

.c-cookies-display {
  font-size: 1.5rem;
}

.c-cookies-amount {
  color: #d2691e;
  font-weight: bold;
}

.c-companions-header {
  margin: 2rem 0 1rem;
  font-size: 2rem;
  color: var(--color-text);
  text-shadow: 0 0 5px var(--color-text);
}

.c-total-effects-summary {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  padding: 1rem 2rem;
  margin: 1rem 0 2rem;
  min-width: 400px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  animation: summary-fade-in 0.5s ease-out;
}

@keyframes summary-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.c-total-effects-header {
  color: var(--color-accent);
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.c-total-effects-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: left;
}

.c-total-effect-item {
  font-family: Typewriter, serif;
  color: white;
  font-size: 0.95rem;
  text-shadow: 0 0 2px black;
}

.l-active-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.l-bank-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
  max-width: 900px;
}

.c-companion-slot {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px dashed var(--color-text);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.c-companion-slot:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 10px var(--color-accent);
  transform: scale(1.05);
}

.c-companion-slot--active {
  width: 90px;
  height: 90px;
  border-style: solid;
  border-width: 3px;
}

.c-companion-slot--fav {
    border-color: #e91e63; /* Pink border */
    box-shadow: 0 0 10px #e91e63, inset 0 0 5px #e91e63;
}

.c-companion-slot--selected {
  border-color: var(--color-good);
  box-shadow: 0 0 15px var(--color-good), inset 0 0 10px var(--color-good);
}

.c-companion-slot--fav.c-companion-slot--selected {
    box-shadow: 0 0 15px var(--color-good), 0 0 5px #e91e63, inset 0 0 10px var(--color-good);
    border-color: var(--color-good); /* Selection overrides or mixes? Selection color is usually green/good */
    /* Let's double border? or mix. Priority to selection usually. */
}

.c-companion-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-accent) 0%, rgba(0,0,0,0) 80%);
}

.c-companion-symbol-individual {
  position: absolute;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 0 5px black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.c-companion-slot--bank .c-companion-symbol-individual {
  font-size: 1.2rem;
}

.c-selected-symbol .c-companion-symbol-individual {
  font-size: 3rem;
}

.c-slot-id {
  opacity: 0.3;
  font-size: 1rem;
}

.c-selected-companion-container {
  width: 100%;
  margin-top: 1rem;
  /* Fixed height to prevent shifting. This needs to be large enough for the detailed view */
  height: 250px; 
  display: flex;
  justify-content: center;
}

.c-selected-companion-panel {
  padding: 1rem;
  border-top: 1px solid var(--color-accent);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-selected-companion-panel--placeholder {
    opacity: 0.5;
    justify-content: center;
}

.c-selected-placeholder-text {
    font-style: italic;
    margin-top: 1rem;
}

.c-selected-header {
    color: var(--color-accent);
    margin-bottom: 0.5rem;
}

.c-selected-info {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.c-selected-symbol {
    font-size: 3rem;
    color: gold;
    text-shadow: 0 0 10px gold;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px; /* Give it some width/height for centering child absolute items */
    height: 60px;
}

.c-selected-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.c-name-input {
    background: transparent;
    border: 1px solid var(--color-text);
    color: var(--color-text);
    padding: 0.2rem 0.5rem;
    font-family: Typewriter, serif;
    font-size: 1.1rem;
    text-align: center;
    width: 250px;
}

.c-name-input:focus {
    border-color: var(--color-accent);
    outline: none;
}

.o-primary-btn--delete {
    margin-top: 1rem;
    background-color: #d32f2f;
    border-color: #b71c1c;
    color: white;
    width: 200px;
}

.o-primary-btn--delete:hover {
    background-color: #e53935;
}

.o-primary-btn--delete-confirm {
    background-color: #c62828 !important;
    font-weight: bold;
    animation: pulse 1s infinite alternate;
}

@keyframes pulse {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
}

.c-selected-symbol--fav {
    color: #e91e63;
    text-shadow: 0 0 15px #e91e63;
}



.c-selected-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.o-primary-btn--bulk-junk {
    background-color: #3e2723; /* Darker brown */
    border-color: #5d4037;
    color: #ffccbc; /* Light orange text */
}

.o-primary-btn--bulk-junk:hover {
    background-color: #4e342e;
}

.c-summon-controls {
    display: flex;
    gap: 1rem;
}

.c-summon-btn--mighty {
    background-color: #673ab7; /* Deep Purple */
    border-color: #512da8;
}

.c-summon-btn--mighty:hover {
    background-color: #7e57c2;
}

.c-instruction-text {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    font-style: italic;
}
</style>
