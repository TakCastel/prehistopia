import { defineStore } from "pinia";
import { ref } from "vue";
import { useMapStore } from "@/stores/useMapStore";
import { useResourceStore } from "@/stores/useResourceStore";

export const useMeepleStore = defineStore("meeple", () => {
  const meeples = ref([]);
  const mapStore = useMapStore();
  const resourceStore = useResourceStore();

  function createMeepleAt(x, y) {
    meeples.value.push({
      facing: "right",
      x,
      y,
      drawX: x,
      drawY: y,
      speed: 0.001 + Math.random() * 0.002,
      hopPhase: Math.random() * Math.PI * 2,
      type: Math.random() < 0.5 ? "f" : "h",
    });
  }

  function placeMeepleNearHouse() {
    const housingCodes = ["branch_hut", "leather_shelter", "family_house"];
    const candidates = [];

    for (let y = 0; y < mapStore.rows; y++) {
      for (let x = 0; x < mapStore.cols; x++) {
        const cell = mapStore.map[y]?.[x];
        if (!cell || !housingCodes.includes(cell.building)) continue;

        const alreadyUsed = meeples.value.some((m) => m.x === x && m.y === y);
        if (!alreadyUsed) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) {
      console.warn("🚫 Aucune maison disponible pour y placer un meeple.");
      return;
    }

    const random = candidates[Math.floor(Math.random() * candidates.length)];
    createMeepleAt(random.x, random.y);
  }

  function getMeepleCountFromPopulation(pop) {
    if (pop <= 10) return pop;

    // On garde les 10 premiers plein
    const offset = 10;
    const reduced = Math.pow(pop - offset, 0.5);
    return offset + Math.floor(reduced);
  }

  function syncMeeplesWithPopulation() {
    const mapReady = Array.isArray(mapStore.map) && mapStore.map.length > 0;
    if (!mapReady) return;

    const target = getMeepleCountFromPopulation(resourceStore.population);
    const current = meeples.value.length;

    if (target > current) {
      for (let i = 0; i < target - current; i++) {
        placeMeepleNearHouse();
      }
    } else if (target < current) {
      meeples.value.splice(0, current - target);
    }
  }

  function resetMeeples() {
    meeples.value = [];
  }

  function moveMeeples() {
    for (const meeple of meeples.value) {
      const dx = meeple.x - meeple.drawX;
      const dy = meeple.y - meeple.drawY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const step = meeple.speed || 0.025;

      if (Math.abs(dx) > 0.01) {
        meeple.facing = dx > 0 ? "right" : "left";
      }

      if (distance < step) {
        meeple.drawX = meeple.x;
        meeple.drawY = meeple.y;
      } else {
        meeple.drawX += (dx / distance) * step;
        meeple.drawY += (dy / distance) * step;
      }
    }
  }

  function moveMeepleToRandomNeighbor(meeple) {
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];

    const options = directions
      .map(([dx, dy]) => ({ x: meeple.x + dx, y: meeple.y + dy }))
      .filter(({ x, y }) => {
        const cell = mapStore.map[y]?.[x];
        return (
          x >= 0 &&
          y >= 0 &&
          x < mapStore.cols &&
          y < mapStore.rows &&
          cell &&
          !["mountain", "water"].includes(cell.terrainType) &&
          cell.building !== "campfire"
        );
      });

    if (options.length > 0) {
      const target = options[Math.floor(Math.random() * options.length)];

      if (target.x < meeple.x) meeple.facing = "left";
      else if (target.x > meeple.x) meeple.facing = "right";

      meeple.x = target.x;
      meeple.y = target.y;
    }
  }

  let animationFrame = null;
  let lastMoveTime = 0;

  function startContinuousMovement() {
    function loop() {
      const now = performance.now();

      if (now - lastMoveTime > 500) {
        for (const meeple of meeples.value) {
          if (meeple.drawX === meeple.x && meeple.drawY === meeple.y) {
            moveMeepleToRandomNeighbor(meeple);
          }
        }
        lastMoveTime = now;
      }

      moveMeeples();
      animationFrame = requestAnimationFrame(loop);
    }

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(loop);
    }
  }

  function stopContinuousMovement() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    meeples,
    syncMeeplesWithPopulation,
    resetMeeples,
    moveMeeples,
    startContinuousMovement,
    stopContinuousMovement,
  };
});
