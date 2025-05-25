<template>
  <div class="relative">
    <!-- Bouton stats (inline avec les autres boutons) -->
    <button
      class="bg-[#4E3B31] hover:bg-[#3B2B24] text-white px-3 py-1 rounded text-sm shadow"
      @click="show = !show"
    >
      {{ show ? "Fermer" : "Statistiques" }}
    </button>

    <div
      v-if="show"
      class="absolute top-full left-0 mt-7 z-10 w-[640px] max-h-[70vh] overflow-auto bg-[#2E211B]/80 text-[#D7BFA5] p-4 rounded shadow-lg text-sm backdrop-blur"
    >
      <!-- Bouton fermeture -->
      <button
        class="absolute top-2 right-3 text-[#D7BFA5] hover:text-red-400 text-lg font-bold"
        title="Fermer"
        @click="show = false"
      >
        ×
      </button>

      <h2 class="text-base font-bold mb-3 border-b border-[#D7BFA5]/30 pb-1">
        Bâtiments construits
      </h2>

      <table class="w-full text-xs">
        <thead class="bg-[#D7BFA5]/10">
          <tr class="text-left">
            <th class="px-2 py-1">Bâtiment</th>
            <th class="px-2 py-1">Qté</th>
            <th class="px-2 py-1">Revenus</th>
            <th class="px-2 py-1">Dépenses</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in builtBuildings"
            :key="b.code"
            class="border-b border-[#D7BFA5]/10"
          >
            <td class="px-2 py-1 font-medium">{{ b.name }}</td>
            <td class="px-2 py-1">{{ b.count }}</td>
            <td class="px-2 py-1">
              <div
                v-for="[res, val] in Object.entries(b.totalIncome).filter(
                  ([_, v]) => v > 0
                )"
                :key="res"
                class="flex items-center gap-1"
              >
                <Icon
                  :name="getResourceIcon(res)"
                  :class="['w-4 h-4', getResourceColor(res)]"
                />
                <span>+{{ val }}</span>
              </div>
            </td>
            <td class="px-2 py-1">
              <div
                v-for="[res, val] in Object.entries(b.totalIncome).filter(
                  ([_, v]) => v < 0
                )"
                :key="res"
                class="flex items-center gap-1"
              >
                <Icon
                  :name="getResourceIcon(res)"
                  :class="['w-4 h-4', getResourceColor(res)]"
                />
                <span>{{ val }}</span>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <!-- Espace entre le tableau et les stats -->
          <tr>
            <td colspan="4" class="h-3" />
          </tr>

          <tr v-for="(row, index) in summaryRows" :key="index">
            <td colspan="4" class="py-1">
              <div class="grid grid-cols-2 items-center text-sm px-1">
                <div class="flex items-center gap-2 text-[#D7BFA5]/80">
                  <Icon :name="row.icon" class="w-4 h-4" />
                  <span>{{ row.label }}</span>
                </div>
                <div
                  class="text-right font-semibold"
                  :class="{
                    'text-green-400': row.color === 'green',
                    'text-blue-400': row.color === 'blue',
                    'text-red-400': row.color === 'red',
                    'text-white': row.color === 'white',
                  }"
                >
                  {{ row.prefix }}{{ row.value }}
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMapStore } from "@/stores/useMapStore";
import { useResourceStore } from "@/stores/useResourceStore";
import buildingData from "@/assets/data/buildings.json";

const show = ref(false);
const mapStore = useMapStore();
const resourceStore = useResourceStore();

const foodTypes = ["meat", "roots", "wheat", "medicinalHerbs"];

const builtBuildings = computed(() => {
  const counts = {};

  for (const row of mapStore.map) {
    for (const cell of row) {
      const code = cell.building;
      if (!code) continue;
      counts[code] = (counts[code] || 0) + 1;
    }
  }

  const list = [];
  for (const category of buildingData.categories) {
    for (const b of category.buildings) {
      if (!counts[b.code]) continue;

      const count = counts[b.code];
      const totalIncome = {};

      if (b.income) {
        for (const [res, val] of Object.entries(b.income)) {
          totalIncome[res] = (totalIncome[res] || 0) + val * count;
        }
      }

      list.push({
        ...b,
        count,
        totalIncome,
      });
    }
  }
  return list;
});

const totalFoodProduction = computed(() => {
  return builtBuildings.value.reduce((sum, b) => {
    for (const [res, val] of Object.entries(b.totalIncome)) {
      if (foodTypes.includes(res) && val > 0) {
        sum += val;
      }
    }
    return sum;
  }, 0);
});

const population = computed(() => resourceStore.population);

const goldBalance = computed(() => {
  let total = 0;
  for (const b of builtBuildings.value) {
    const gold = b.totalIncome?.gold || 0;
    total += gold;
  }
  return total;
});

const summaryRows = computed(() => [
  {
    label: "Nourriture produite",
    value: totalFoodProduction.value,
    icon: "fluent:food-apple-20-filled",
    color: "green",
    prefix: "",
  },
  {
    label: "Population actuelle",
    value: population.value,
    icon: "mdi:account",
    color: "blue",
    prefix: "",
  },
  {
    label: "Coquillages",
    value: Math.abs(goldBalance.value),
    icon: "fluent-emoji:spiral-shell",
    color:
      goldBalance.value > 0 ? "green" : goldBalance.value < 0 ? "red" : "white",
    prefix: goldBalance.value > 0 ? "+" : goldBalance.value < 0 ? "-" : "",
  },
]);

function getResourceIcon(resource) {
  const icons = {
    stoneTools: "mdi:hammer-screwdriver",
    leather: "mdi:tshirt-crew",
    processedWood: "game-icons:packed-planks",
    pottery: "game-icons:painted-pottery",
    wheat:
      "streamline:food-wheat-cook-plant-bread-gluten-grain-cooking-nutrition-food-wheat",
    roots: "fa6-solid:carrot",
    medicinalHerbs: "mdi:leaf",
    stone: "game-icons:stone-block",
    meat: "mdi:food-steak",
    faith: "mdi:star-face",
    gold: "fluent-emoji:spiral-shell",
  };
  return icons[resource] || "mdi:help-circle-outline";
}

function getResourceColor(resource) {
  const colors = {
    stoneTools: "text-gray-400",
    leather: "text-orange-700",
    processedWood: "text-amber-500",
    pottery: "text-rose-600",
    wheat: "text-yellow-600",
    roots: "text-orange-600",
    medicinalHerbs: "text-green-600",
    stone: "text-gray-500",
    meat: "text-red-600",
    faith: "text-purple-500",
    gold: "text-yellow-400",
  };
  return colors[resource] || "text-white";
}
</script>
