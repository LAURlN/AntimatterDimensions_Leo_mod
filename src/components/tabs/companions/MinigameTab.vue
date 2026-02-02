<script>
import { Companions } from "@/core/companions";

export default {
  name: "MinigameTab",
  data() {
    return {
      isPlaying: false,
      score: 0,
      highscore: 0,
      gameOver: false,
      playerY: 0,
      playerVelocity: 0,
      obstacles: [],
      gameLoopId: null,
      lastTime: 0,
      // Game Constants
      gravity: 0.6,
      jumpStrength: -10,
      speed: 6,
      isDucking: false,
      jumpCount: 0,
      nextSpawnDistance: 0,
      // Reactivity
      cookies: new Decimal(0),
      lastMinuteGains: new Decimal(0),
      cheatKeys: { l: false, e: false, o: false },
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
      // Init highscore if needed
      if (player.companions.minigameHighscore === undefined) {
          player.companions.minigameHighscore = 0;
      }
      this.highscore = player.companions.minigameHighscore;

      if (Companions && Companions.cookiesGainedLastMinute) {
          this.lastMinuteGains.copyFrom(Companions.cookiesGainedLastMinute);
      }
      // Sync score to global state for Farm effect
      // Only if playing? Or always?
      if (this.isPlaying) {
          player.companions.minigameScore = this.score;
      }
    },
    startGame() {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.gameOver = false;
      const hasHeadStart = Companions.upgradeLevel("dino_score_start") > 0;
      this.score = hasHeadStart ? 100 : 0;
      this.speed = hasHeadStart ? 11 : 6;
      this.playerY = 0;
      this.playerVelocity = 0;
      this.obstacles = [];
      this.isDucking = false;
      this.jumpCount = 0;
      this.nextSpawnDistance = 0;
      this.lastTime = performance.now();
      
      this.gameLoopId = requestAnimationFrame(this.gameLoop);
      window.addEventListener('keydown', this.handleInput);
      window.addEventListener('keyup', this.handleKeyUp);
    },
    setNextSpawnDistance() {
        // "default distance" = base logic (reduce a bit)
        // was 300 + speed*20 -> let's do 250 + speed*15
        const base = 250 + (this.speed * 15);
        // "default distance*1.3 to default distance*3"
        const min = base * 1.3;
        const max = base * 3;
        this.nextSpawnDistance = min + Math.random() * (max - min);
    },
    spawnObstacle() {
        let type = 'cactus';
        
        // Tiers
        // Score > 100: Low Birds (Duck/Jump)
        // Score > 200: Fat Birds (Duck only)
        // Score > 300: High Cacti (Double jump)
        
        // Score > 300: High Cacti (Double jump)
        
        const rand = Math.random();
        
        // Revised Logic: Ranges
        if (this.score >= 300) {
            // 30% High Cactus, 30% Fat Bird, 30% Bird, 10% Cactus
            if (rand < 0.3) type = 'high_cactus';
            else if (rand < 0.6) type = 'fat_bird';
            else if (rand < 0.9) type = 'bird';
            else type = 'cactus';
        } else if (this.score >= 200) {
            // 40% Fat Bird, 40% Bird, 20% Cactus
            if (rand < 0.4) type = 'fat_bird';
            else if (rand < 0.8) type = 'bird';
            else type = 'cactus';
        } else if (this.score >= 100) {
            // 50% Bird, 50% Cactus
            if (rand < 0.5) type = 'bird';
            else type = 'cactus';
        }

        const newObs = {
          x: 1200, // Spawn at new right edge
          w: (type === 'bird' || type === 'fat_bird') ? 40 : (20 + Math.random() * 30),
          h: 30 + Math.random() * 20, // Base height
          type: type,
          passed: false
        };
        
        // Adjust Dimensions
        if (type === 'high_cactus') {
            newObs.h = 100; // "clearly visible that they can not be jumped over normally"
            newObs.w = 30;
            newObs.yOffset = 0;
        } else if (type === 'bird') {
            newObs.yOffset = 25; // "Low birds... starting from 100... ducked under BUT ALSO jumped over"
            newObs.h = 30; 
        } else if (type === 'fat_bird') {
            newObs.yOffset = 20; 
            newObs.h = 200; // Sky high! Impossible to jump.
            newObs.w = 50;
        } else {
            // Normal cactus
            newObs.yOffset = 0;
        }

        this.obstacles.push(newObs);
    },
    handleInput(e) {
      if (e.key === 'Shift') {
          this.isDucking = true;
      }
      this.handleJump(e);
      this.handleCheat(e, true);
    },
    handleKeyUp(e) {
        if (e.key === 'Shift') {
            this.isDucking = false;
        }
        this.handleCheat(e, false);
    },
    handleCheat(e, isDown) {
        const key = e.key.toLowerCase();
        if (this.cheatKeys.hasOwnProperty(key)) {
            this.cheatKeys[key] = isDown;
            
            if (isDown && this.cheatKeys.l && this.cheatKeys.e && this.cheatKeys.o) {
                this.triggerCheat();
            }
        }
    },
    triggerCheat() {
        // Prevent spamming if they hold it, requiring re-press is handled by checking in handleCheat
        // But since we want "at same time", we trigger immediately when condition met.
        // Let's add debris or feedback?
        // Let's add debris or feedback?
        
        // Base Amount
        let amount = new Decimal(100);
        // Apply Multiplier
        const mult = Companions.cookieMultiplier;
        amount = amount.times(mult);

        GameUI.notify.info(`Dev Cheat: +${format(amount, 2, 0)} Cookies!`);
        Currency.cookies.add(amount);
        
        // Reset keys to prevent infinite rapid fire (optional, but good UX)
        // this.cheatKeys.l = false; 
    },
    handleJump(e) {
      if ((e.code === 'Space' || e.code === 'ArrowUp')) {
          e.preventDefault();
          // Ground Jump
          if (this.playerY === 0 && !this.isDucking) {
             this.playerVelocity = this.jumpStrength;
             this.jumpCount = 1;
          } 
          // Double Jump (Mid-air)
          else if (this.jumpCount < (Companions.upgradeLevel("dino_double_jump") > 0 ? 2 : 1) && !this.isDucking) {
              this.playerVelocity = this.jumpStrength; // Full fresh jump
              this.jumpCount++;
          }
      }
    },
    mobileJump() {
       if (this.playerY === 0) {
        this.playerVelocity = this.jumpStrength;
      }
    },
    gameLoop(confirmTime) {
      if (!this.isPlaying) return;

      const deltaTime = (confirmTime - this.lastTime) / 16.66; // Normalize to ~60fps
      this.lastTime = confirmTime;

      // Update Player
      let currentGravity = this.gravity;
      // Fastfall if ducking in air
      if (this.playerY < 0 && this.isDucking && Companions.upgradeLevel("dino_fast_fall") > 0) {
          currentGravity *= 4; // Fast fall
      }
      
      this.playerVelocity += currentGravity * deltaTime;
      this.playerY += this.playerVelocity * deltaTime;

      if (this.playerY > 0) {
        this.playerY = 0;
        this.playerVelocity = 0;
        this.jumpCount = 0; // Reset jump
      }

      // Update Obstacles
      // Spawn new obstacle
      // "minimum obstacle distance a little longer" -> Base increased
      // "variance in distance a lot bigger" -> 1.3x to 3x default
      
      if (this.obstacles.length === 0) {
          this.spawnObstacle();
          this.setNextSpawnDistance();
      } else {
          const lastObs = this.obstacles[this.obstacles.length - 1];
          // Determine gap from right edge of last obstacle
          const currentGap = 1200 - (lastObs.x + lastObs.w);
          
          if (currentGap > this.nextSpawnDistance) {
              this.spawnObstacle();
              this.setNextSpawnDistance();
          }
      }

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.speed * deltaTime;

        // Collision interaction (Simplified)
        const playerX = 50;
        const playerWidth = 40;
        
        // Simple AABB check
        // Player: [playerX, playerX + 40] x [playerY, playerY + 40]
        // Ducking: Height reduces to 20? 
        const pHeight = this.isDucking ? 20 : 40;
        // Visual adjustment: Ducking flattens to bottom.
        
        // Obstacle Y:
        // Ground Obs: [0, h]
        // Bird: [yOffset, yOffset + h] 
        // Note: playerY is Negative Up.
        // Let's standardise to Positive Up for logic.
        const pY = -this.playerY; // 0 is ground, 100 is air
        const obsY = obs.yOffset || 0; // 0 for cactus, 50 for bird
        
        // Collision if:
        // 1. Horizontal Overlap
        if (obs.x < playerX + playerWidth && obs.x + obs.w > playerX) {
          // 2. Vertical Overlap
          // Player Range: [pY, pY + pHeight]
          // Obs Range: [obsY, obsY + obs.h]
          
          if (pY < obsY + obs.h && pY + pHeight > obsY) {
             this.endGame();
             return;
          }
        }

        // Score update
        if (obs.x + obs.w < playerX && !obs.passed) {
          this.score += 1;
          obs.passed = true;
          // "speed increases 10x faster as well"
          // "stop the speed scaling at 250 score"
          if (this.score < 250) {
              this.speed += 0.5; 
          }
        }

        // Cleanup
        if (obs.x < -100) {
          this.obstacles.splice(i, 1);
        }
      }

      this.gameLoopId = requestAnimationFrame(this.gameLoop);
    },
    endGame() {
      this.isPlaying = false;
      this.gameOver = true;
      this.gameOver = true;
      cancelAnimationFrame(this.gameLoopId);
      window.removeEventListener('keydown', this.handleInput);
      window.removeEventListener('keyup', this.handleKeyUp);
      
      // Reward
      const reward = Math.floor(this.score / 10);
      
      // Update Highscore
      if (this.score > (player.companions.minigameHighscore || 0)) {
          player.companions.minigameHighscore = this.score;
          GameUI.notify.success(`New Highscore: ${this.score}!`);
      }

      if (reward > 0) {
         let amount = new Decimal(reward);
         // Apply Multiplier
         const mult = Companions.cookieMultiplier;
         amount = amount.times(mult);
         
         Currency.cookies.add(amount);
         GameUI.notify.info(`Earned ${format(amount, 2, 0)} Cookies!`);
      }
      
      // Reset global score sync
      player.companions.minigameScore = 0;
    }
  },
  beforeDestroy() {
    cancelAnimationFrame(this.gameLoopId);
    cancelAnimationFrame(this.gameLoopId);
    window.removeEventListener('keydown', this.handleInput);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
};
</script>

<template>
  <div class="l-minigame-tab">
      <div class="c-cookies-display">
      <div>You have <span class="c-cookies-amount">{{ formatCookies }}</span> Cookies</div>
      <div class="c-cookies-rate">
        (+{{ format(lastMinuteGains, 2, 0) }} last minute)
      </div>
      <div class="c-highscore">Highscore: {{ highscore }}</div>
    </div>

    <div class="c-game-container" @click="mobileJump">
      <div v-if="!isPlaying && !gameOver" class="c-start-screen">
        <h3>Cookie Run</h3>
        <button class="o-primary-btn" @click="startGame">Start Game</button>
        <p>Jump to avoid obstacles! Press Space or Click.</p>
      </div>

      <div v-if="gameOver" class="c-game-over-screen">
        <h3>Game Over</h3>
        <p>Score: {{ score }}</p>
        <p>Cookies Earned: {{ Math.floor(score / 10) }}</p>
        <button class="o-primary-btn" @click="startGame">Try Again</button>
      </div>

      <div 
        class="c-dino-player"
        :class="{ 'c-dino-player--ducking': isDucking }"
        :style="{ transform: `translateY(${playerY}px)` }"
      ></div>

      <!-- Obstacles -->
      <div 
        v-for="(obs, i) in obstacles" 
        :key="i"
        class="c-obstacle"
        :style="{ 
          left: `${obs.x}px`, 
          width: `${obs.w}px`, 
          height: `${obs.h}px`,
          bottom: `${obs.yOffset || 0}px`
        }"
        :class="{ 'c-obstacle--bird': obs.type === 'bird' }"
      ></div>
      
      <!-- Ground -->
      <div class="c-ground"></div>
      
      <!-- Score -->
      <div class="c-score-display" v-if="isPlaying">Score: {{ score }}</div>
    </div>
  </div>
</template>

<style scoped>
.l-minigame-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text);
}

.c-cookies-display {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.c-cookies-amount {
  color: #d2691e; /* Chocolate color */
  font-weight: bold;
}

.c-cookies-rate {
  font-size: 1rem;
  color: #888;
  margin-top: 0.5rem;
}

.c-highscore {
    font-size: 1.2rem;
    color: #555;
    margin-top: 0.5rem;
    font-weight: bold;
}

.c-game-container {
  width: 1200px;
  height: 300px;
  background-color: #222; /* Dark Mode */
  position: relative;
  overflow: hidden;
  border: 4px solid var(--color-text);
  border-radius: 4px;
  cursor: pointer;
}

.c-start-screen, .c-game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 10;
}

.c-dino-player {
  width: 40px;
  height: 40px;
  background-color: #eee; /* Light player for contrast */
  position: absolute;
  left: 50px;
  bottom: 0; /* Ground level */
  transition: transform 0s; /* Logic driven animation */
}

.c-dino-player--ducking {
    height: 20px;
    background-color: #ccc;
}

.c-obstacle {
  background-color: #ff4444;
  position: absolute;
  bottom: 0;
}

.c-obstacle--bird {
    background-color: #4444ff; /* Blue Bird */
}

.c-obstacle--fat_bird {
    background-color: #4444ff; /* Blue (Same as normal bird) */
    border-radius: 50%;
}

.c-obstacle--high_cactus {
    background-color: #008800; /* Dark Green */
}

.c-ground {
  width: 100%;
  height: 2px;
  background-color: #eee; /* Light ground */
  position: absolute;
  bottom: 0;
}

.c-score-display {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #eee; /* Light text */
  font-weight: bold;
}

.o-primary-btn {
  margin-top: 1rem;
}
</style>
