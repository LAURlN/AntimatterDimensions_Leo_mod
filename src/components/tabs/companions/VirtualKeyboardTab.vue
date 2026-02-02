<script>
export default {
  name: "VirtualKeyboardTab",
  data() {
    return {
      heldKeys: [],
      rows: [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["shift", "z", "x", "c", "v", "b", "n", "m", "/", "enter"],
        ["ctrl", "alt", "space", "esc", "tab"]
      ]
    };
  },
  methods: {
    update() {
      this.heldKeys = player.companions.virtualKeypad.heldKeys;
    },
    toggleKey(key) {
      const index = this.heldKeys.indexOf(key);
      if (index === -1) {
        this.heldKeys.push(key);
      } else {
        this.heldKeys.splice(index, 1);
      }
      player.companions.virtualKeypad.heldKeys = this.heldKeys;
    },
    isHeld(key) {
      return this.heldKeys.includes(key);
    },
    viewHotkeys() {
      Modal.hotkeys.show();
    },
    clearAll() {
        player.companions.virtualKeypad.heldKeys = [];
        this.heldKeys = [];
    }
  }
};
</script>

<template>
  <div class="l-virtual-keyboard-tab">
    <div class="c-keyboard-header">
        <h2 class="o-keyboard-title">Virtual Keyboard Automator</h2>
        <p class="o-keyboard-desc">Click keys to toggle them as "held". They will trigger their hotkeys even when the game is not in focus!</p>
    </div>

    <div class="c-keyboard-top-controls">
        <button class="o-primary-btn" @click="viewHotkeys">View Hotkey List</button>
        <button class="o-primary-btn o-primary-btn--red" @click="clearAll">Clear All Held Keys</button>
    </div>

    <div class="c-keyboard-area">
      <div v-for="(row, i) in rows" :key="i" class="c-keyboard-row">
        <div 
          v-for="key in row" 
          :key="key" 
          class="c-key"
          :class="{ 'c-key--held': isHeld(key), 'c-key--wide': key.length > 1 }"
          @click="toggleKey(key)"
        >
          {{ key.toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.l-virtual-keyboard-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text);
  user-select: none;
}

.c-keyboard-header {
    text-align: center;
    margin-bottom: 2rem;
}

.o-keyboard-title {
    color: var(--color-accent);
    font-size: 2.5rem;
    text-shadow: 0 0 10px var(--color-accent);
    margin-bottom: 0.5rem;
}

.o-keyboard-desc {
    font-style: italic;
    opacity: 0.8;
}

.c-keyboard-top-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.c-keyboard-area {
  background: rgba(0, 0, 0, 0.4);
  padding: 2rem;
  border: 2px solid var(--color-accent);
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.c-keyboard-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.c-key {
  width: 50px;
  height: 50px;
  background: #333;
  border: 2px solid #555;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
  font-family: Typewriter, serif;
}

.c-key:hover {
    background: #444;
    border-color: var(--color-accent);
    transform: translateY(-2px);
}

.c-key--held {
  background: var(--color-accent);
  border-color: white;
  color: black;
  box-shadow: 0 0 15px var(--color-accent);
  transform: translateY(2px);
}

.c-key--wide {
  width: auto;
  padding: 0 1rem;
  min-width: 80px;
}

.o-primary-btn--red {
    background-color: #d32f2f;
    border-color: #b71c1c;
}

.o-primary-btn--red:hover {
    background-color: #e53935;
}
</style>
