<template>
  <div
    v-if="Object.keys(filteredResources).length > 0"
    class="fixed top-16 left-4 bg-[#2E211B]/80 text-[#D7BFA5] p-2 rounded shadow-lg flex flex-col gap-1 min-w-[120px] z-50"
  >
    <div
      v-for="(value, resource) in filteredResources"
      :key="resource"
      class="flex items-center gap-2 text-sm"
      :title="getResourceLabel(resource)"
    >
      <Icon
        :name="getResourceIcon(resource)"
        :class="['w-4 h-4', getResourceColor(resource)]"
      />
      <span>{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResourceStore } from "@/stores/useResourceStore";

const store = useResourceStore();
const {
  stone,
  stoneTools,
  leather,
  processedWood,
  pottery,
  wheat,
  roots,
  medicinalHerbs,
  meat,
  faith,
} = storeToRefs(store);

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
  };
  return colors[resource] || "text-white";
}

function getResourceLabel(resource) {
  const labels = {
    stoneTools: "Outils en pierre",
    leather: "Peaux",
    processedWood: "Bois travaillé",
    pottery: "Poterie",
    wheat: "Blé",
    roots: "Racines",
    medicinalHerbs: "Herbes médicinales",
    stone: "Pierre",
    meat: "Viande",
    faith: "Foi",
  };
  return labels[resource] || "Inconnu";
}

const filteredResources = computed(() => {
  const resources = {};

  if (stoneTools.value >= 1) resources.stoneTools = stoneTools.value;
  if (leather.value >= 1) resources.leather = leather.value;
  if (processedWood.value >= 1) resources.processedWood = processedWood.value;
  if (pottery.value >= 1) resources.pottery = pottery.value;
  if (wheat.value >= 1) resources.wheat = wheat.value;
  if (roots.value >= 1) resources.roots = roots.value;
  if (medicinalHerbs.value >= 1)
    resources.medicinalHerbs = medicinalHerbs.value;
  if (stone.value >= 1) resources.stone = stone.value;
  if (meat.value >= 1) resources.meat = meat.value;
  if (faith.value >= 1) resources.faith = faith.value;

  return resources;
});
</script>
