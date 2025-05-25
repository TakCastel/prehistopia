import { defineStore } from "pinia";
import { ref, watch } from "vue";
import buildingsData from "@/assets/data/buildings.json";
import { useAlertStore } from "@/stores/useAlertStore";
import { useMeepleStore } from "#imports";

export const useResourceStore = defineStore(
  "resource",
  () => {
    const gold = ref(560);
    const stoneTools = ref(0);
    const leather = ref(0);
    const processedWood = ref(0);
    const pottery = ref(0);
    const wheat = ref(100);
    const roots = ref(0);
    const medicinalHerbs = ref(0);
    const stone = ref(0);
    const meat = ref(50);
    const faith = ref(0);
    const population = ref(0);

    const inactiveBuildings = ref({});
    const incomeInterval = 10 * 1000;

    let incomeStarted = false;

    function addGold(amount) {
      gold.value += amount;
    }

    function spendResources(cost) {
      const canSpend = Object.entries(cost).every(
        ([resource, amount]) => resourceStore[resource]?.value >= amount
      );
      if (!canSpend) return false;

      for (const [resource, amount] of Object.entries(cost)) {
        resourceStore[resource].value -= amount;
      }
      return true;
    }

    function canAfford(cost) {
      return Object.entries(cost).every(
        ([resource, amount]) => resourceStore[resource]?.value >= amount
      );
    }

    function resetResources() {
      gold.value = 560;
      stoneTools.value = 0;
      leather.value = 0;
      processedWood.value = 0;
      pottery.value = 0;
      wheat.value = 100;
      roots.value = 0;
      medicinalHerbs.value = 0;
      stone.value = 0;
      meat.value = 50;
      faith.value = 0;
    }

    function rewardForTreeChop() {
      addGold(3);
    }

    function getIncomeForBuilding(code) {
      for (const category of buildingsData.categories) {
        const building = category.buildings.find((b) => b.code === code);
        if (building?.income) return building.income;
      }
      return null;
    }

    function consumeRandomResources() {
      const foodResources = ["wheat", "roots", "meat", "medicinalHerbs"];

      const consumptionLog = {};

      for (let i = 0; i < population.value; i++) {
        const options = foodResources.filter(
          (res) => resourceStore[res]?.value > 0
        );

        if (options.length === 0) break;

        const chosen = options[Math.floor(Math.random() * options.length)];
        resourceStore[chosen].value -= 1;

        consumptionLog[chosen] = (consumptionLog[chosen] || 0) + 1;
      }
    }

    let incomeTimerId = null;

    function startResourceIncome(getMapFn) {
      console.log("🚀 startResourceIncome called");

      if (incomeTimerId !== null) {
        clearInterval(incomeTimerId); // 🔁 annule l’ancien si existant
      }

      incomeTimerId = setInterval(() => {
        const map = getMapFn();
        if (!Array.isArray(map) || map.length === 0) return;

        const totalIncome = {};
        const availablePop = population.value;
        let assignedPopulation = 0;

        inactiveBuildings.value = {};

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

        const popRequiredCells = [];

        for (let y = 0; y < map.length; y++) {
          for (let x = 0; x < map[y].length; x++) {
            const cell = map[y][x];
            const code = cell.building;
            if (!code) {
              cell.inactive = false;
              continue;
            }

            const income = getIncomeForBuilding(code);
            if (!income) {
              cell.inactive = false;
              continue;
            }

            if (popDependentBuildings.includes(code)) {
              popRequiredCells.push(cell);
            } else {
              cell.inactive = false;
              for (const [resource, amount] of Object.entries(income)) {
                totalIncome[resource] = (totalIncome[resource] || 0) + amount;
              }
            }
          }
        }

        const shuffled = [...popRequiredCells].sort(() => Math.random() - 0.5);
        for (const cell of shuffled) {
          if (assignedPopulation < availablePop) {
            cell.inactive = false;
            const income = getIncomeForBuilding(cell.building);
            for (const [resource, amount] of Object.entries(income)) {
              totalIncome[resource] = (totalIncome[resource] || 0) + amount;
            }
            assignedPopulation++;
          } else {
            cell.inactive = true;
          }
        }

        for (const [resource, amount] of Object.entries(totalIncome)) {
          if (typeof resourceStore[resource]?.value !== "undefined") {
            resourceStore[resource].value += amount;
          }
        }

        const canvas = document.querySelector("canvas");
        if (canvas) {
          const mapStore = useMapStore();
          mapStore.draw(canvas); // ❗️Possiblement lourd aussi
        }

        consumeRandomResources();
      }, incomeInterval);
    }

    function stopResourceIncome() {
      if (incomeTimerId !== null) {
        clearInterval(incomeTimerId);
        incomeTimerId = null;
      }
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

      const meepleStore = useMeepleStore();
      meepleStore.syncMeeplesWithPopulation();
    }

    let famineTimer = null;
    let houseDestructionInterval = null;

    let foodWatcherStop = null;

    function monitorFoodCrisis(mapRef) {
      if (foodWatcherStop) {
        foodWatcherStop(); // 👈 désactive l'ancien watcher s'il existe
      }

      foodWatcherStop = watch(
        () => ({
          totalFood:
            meat.value + roots.value + wheat.value + medicinalHerbs.value,
          requiredFood: population.value,
        }),
        ({ totalFood, requiredFood }) => {
          const famineOngoing = totalFood < requiredFood;

          if (famineOngoing) {
            if (!famineTimer) {
              useAlertStore().push(
                "error",
                "Les réserves de nourriture sont faibles."
              );
              famineTimer = setInterval(() => {
                startHouseDestructionLoop(mapRef);
              }, 10 * 1000);
            }
          } else {
            if (famineTimer) {
              clearInterval(famineTimer);
              famineTimer = null;
            }
            if (houseDestructionInterval) {
              clearInterval(houseDestructionInterval);
              houseDestructionInterval = null;
            }
          }
        },
        { immediate: true, flush: "post" }
      );
    }

    function startHouseDestructionLoop(mapRef) {
      const map = mapRef.value;
      const housingCodes = ["branch_hut", "leather_shelter", "family_house"];
      const ruinCandidates = [];

      // 🔍 On collecte tous les foyers encore intacts
      for (const row of map) {
        for (const cell of row) {
          if (housingCodes.includes(cell.building)) {
            ruinCandidates.push(cell);
          }
        }
      }

      // 🧱 Si aucun foyer, on arrête tout
      if (ruinCandidates.length === 0) {
        clearInterval(houseDestructionInterval);
        houseDestructionInterval = null;

        const mapStore = useMapStore();
        mapStore.saveMap();
        mapStore.draw(document.querySelector("canvas"));
        return;
      }

      // 🎯 Sélection aléatoire
      const chosen =
        ruinCandidates[Math.floor(Math.random() * ruinCandidates.length)];
      chosen.building = "ruin";

      const mapStore = useMapStore();
      mapStore.saveMap();
      mapStore.draw(document.querySelector("canvas"));

      useAlertStore().push("error", "Un foyer s’est vidé.");
    }

    function cleanup() {
      stopResourceIncome();
      if (famineTimer) clearInterval(famineTimer);
      if (houseDestructionInterval) clearInterval(houseDestructionInterval);
      if (foodWatcherStop) foodWatcherStop();

      famineTimer = null;
      houseDestructionInterval = null;
      foodWatcherStop = null;
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
      consumeRandomResources,
      canAfford,
      monitorFoodCrisis,
    };

    return resourceStore;
  },
  { persist: true }
);
