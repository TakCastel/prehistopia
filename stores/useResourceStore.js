import { defineStore } from "pinia";
import { ref } from "vue";

export const useResourceStore = defineStore(
  "resource",
  () => {
    const gold = ref(560);
    const stoneTools = ref(0);
    const leather = ref(0);
    const processedWood = ref(0);
    const pottery = ref(0);
    const wheat = ref(0);
    const roots = ref(0);
    const medicinalHerbs = ref(0);
    const stone = ref(0);
    const meat = ref(0);
    const faith = ref(0);
    const population = ref(0);

    const inactiveBuildings = ref({});
    const incomeInterval = 10 * 1000;

    const incomeBuildings = {
      // Besoins
      campfire: { faith: 1, gold: -3 },
      storage_shelter: { gold: -20 },
      primitive_well: { gold: -15 },
      hunting_traps: { meat: 1, gold: -5 },

      // Logement
      branch_hut: { gold: 50 },
      leather_shelter: { gold: 150 },
      family_house: { gold: 300 },

      // Religion
      wood_totem: { faith: 2, gold: -25 },
      stone_circle: { faith: 4, gold: -60 },
      ritual_altar: { faith: 8, gold: -100 },

      // Industries
      stone_quarry: { stone: 1, gold: -80 },
      stonecutter: { stoneTools: 1, gold: -40 },
      tanning_pit: { leather: 1, gold: -35 },
      pottery_workshop: { pottery: 1, gold: -120 },
      basic_sawmill: { processedWood: 1, gold: -75 },

      // Production
      gathering_area: { medicinalHerbs: 1, gold: -15 },
      root_field: { roots: 1, gold: -50 },
      primitive_farm: { wheat: 1, gold: -100 },

      // Défenses
      wooden_wall: {},
      watchtower: { faith: 1 },
      defensive_trench: {},

      // Recherche
      knowledge_stone: { faith: 2, gold: -200 },
      experimental_lab: { stoneTools: 2, gold: -500 },
    };

    let incomeStarted = false;

    function addGold(amount) {
      gold.value += amount;
    }

    function spendResources(cost) {
      const canSpend = Object.entries(cost).every(([resource, amount]) => {
        return resourceStore[resource]?.value >= amount;
      });
      if (!canSpend) return false;

      for (const [resource, amount] of Object.entries(cost)) {
        resourceStore[resource].value -= amount;
      }
      return true;
    }

    function canAfford(cost) {
      return Object.entries(cost).every(([resource, amount]) => {
        return resourceStore[resource]?.value >= amount;
      });
    }

    function resetResources() {
      gold.value = 560;
      stoneTools.value = 0;
      leather.value = 0;
      processedWood.value = 0;
      pottery.value = 0;
      wheat.value = 0;
      roots.value = 0;
      medicinalHerbs.value = 0;
      stone.value = 0;
      meat.value = 0;
      faith.value = 0;
    }

    function rewardForTreeChop() {
      addGold(3);
    }

    function startResourceIncome(mapRef) {
      console.log("🚀 startResourceIncome called");

      if (incomeStarted) {
        console.warn("⚠️ Income generation already started.");
        return;
      }
      incomeStarted = true;

      setInterval(() => {
        const map = mapRef;
        if (!Array.isArray(map) || map.length === 0) {
          console.warn("⚠️ Map is empty or not ready.");
          return;
        }

        const totalIncome = {};
        const availablePop = population.value;
        let assignedPopulation = 0;

        inactiveBuildings.value = {}; // 🧹 reset propre

        const popDependentBuildings = [
          "stone_quarry",
          "primitive_farm",
          "basic_sawmill",
          "root_field",
          "pottery_workshop",
          "gathering_area",
          "tanning_pit",
          "hunting_traps",
          "stonecutter",
        ];

        for (let y = 0; y < map.length; y++) {
          for (let x = 0; x < map[y].length; x++) {
            const cell = map[y][x];
            const code = cell.building;
            if (!code) {
              cell.inactive = false;
              continue;
            }

            const income = incomeBuildings[code];
            if (!income) {
              cell.inactive = false;
              continue;
            }

            const requiresPop = popDependentBuildings.includes(code);

            if (requiresPop) {
              if (assignedPopulation >= availablePop) {
                cell.inactive = true;
                continue;
              }
              assignedPopulation++;
            }

            cell.inactive = false; // ce bâtiment est actif

            for (const [resource, amount] of Object.entries(income)) {
              totalIncome[resource] = (totalIncome[resource] || 0) + amount;
            }
          }
        }

        for (const [resource, amount] of Object.entries(totalIncome)) {
          if (typeof resourceStore[resource]?.value !== "undefined") {
            resourceStore[resource].value += amount;
          } else {
            console.warn(`⚠️ Resource "${resource}" not found in store.`);
          }
        }
      }, incomeInterval);
    }

    function updatePopulation(mapRef) {
      let total = 0;
      for (const row of mapRef) {
        for (const cell of row) {
          switch (cell.building) {
            case "branch_hut":
              total += 1;
              break;
            case "leather_shelter":
              total += 2;
              break;
            case "family_house":
              total += 5;
              break;
          }
        }
      }
      population.value = total;
    }

    const resourceStore = {
      gold,
      stoneTools,
      leather,
      processedWood,
      pottery,
      wheat,
      roots,
      medicinalHerbs,
      stone,
      meat,
      faith,
      population,
      inactiveBuildings,
      addGold,
      spendResources,
      resetResources,
      rewardForTreeChop,
      startResourceIncome,
      updatePopulation,
      canAfford,
    };

    return resourceStore;
  },
  { persist: true }
);
