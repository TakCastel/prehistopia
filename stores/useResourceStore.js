import { defineStore } from "pinia";
import { ref } from "vue";
import buildingsData from "@/assets/data/buildings.json";
import { useAlertStore } from "@/stores/useAlertStore";

export const useResourceStore = defineStore(
  "resource",
  () => {
    const gold = ref(560);
    const stoneTools = ref(0);
    const leather = ref(0);
    const processedWood = ref(0);
    const pottery = ref(0);
    const wheat = ref(10);
    const roots = ref(0);
    const medicinalHerbs = ref(0);
    const stone = ref(0);
    const meat = ref(20);
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
      wheat.value = 10;
      roots.value = 0;
      medicinalHerbs.value = 0;
      stone.value = 0;
      meat.value = 20;
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

      if (Object.keys(consumptionLog).length > 0) {
        console.log(
          "🍽️ Nourriture consommée par la population :",
          consumptionLog
        );
      } else {
        console.log("⚠️ Aucun aliment disponible à consommer.");
      }
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

            const requiresPop = popDependentBuildings.includes(code);
            if (requiresPop) {
              if (assignedPopulation >= availablePop) {
                cell.inactive = true;
                continue;
              }
              assignedPopulation++;
            }

            cell.inactive = false;

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

        consumeRandomResources();
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

    let famineTimer = null;
    let houseDestructionInterval = null;

    function monitorFoodCrisis(mapRef) {
      watchEffect(() => {
        const totalFood = meat.value + roots.value + wheat.value;

        if (totalFood === 0 && !famineTimer) {
          useAlertStore().push(
            "error",
            "La famine frappe votre communauté, trouvez vite des sources de nourriture !"
          );

          famineTimer = setTimeout(() => {
            startHouseDestructionLoop(mapRef);
          }, 60 * 1000);
        }

        if (totalFood > 0) {
          // Nourriture revenue : on annule les timers
          clearTimeout(famineTimer);
          clearInterval(houseDestructionInterval);
          famineTimer = null;
          houseDestructionInterval = null;
        }
      });
    }

    function startHouseDestructionLoop(mapRef) {
      console.warn("☠️ Début des destructions de maisons.");

      houseDestructionInterval = setInterval(async () => {
        const map = mapRef.value;
        const housingCodes = ["branch_hut", "leather_shelter", "family_house"];

        for (const row of map) {
          for (const cell of row) {
            if (housingCodes.includes(cell.building)) {
              cell.building = "ruin";

              const mapStore = useMapStore();
              await mapStore.saveMap();

              useAlertStore().push(
                "error",
                "Un habitant a quitté votre village car il manquait de nourriture."
              );
              return; // une seule maison détruite par minute
            }
          }
        }

        console.warn("Aucune maison restante à détruire.");
        clearInterval(houseDestructionInterval);
      }, 60 * 1000);
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
