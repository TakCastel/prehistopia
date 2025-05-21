<template>
  <div
    class="hidden group-hover:flex absolute right-full top-0 mr-2 bg-[#FFF9EE] w-52 p-3 rounded-md shadow-lg border border-[#D9C2A6] text-[#4B3A29] flex-col items-stretch overflow-y-auto max-h-[70vh] z-50"
  >
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="building.name"
      class="w-12 h-12 object-contain mx-auto mb-2"
    />

    <div class="text-base font-bold mb-1 text-center">{{ building.name }}</div>
    <p class="text-xs italic mb-2 text-center">
      {{ building.description || "—" }}
    </p>

    <div v-if="building.cost?.gold || hasResourceCosts" class="mb-2">
      <div class="text-xs font-semibold mb-1">Coût :</div>
      <ul class="text-xs flex flex-col gap-1">
        <li v-if="building.cost?.gold" class="flex items-center gap-1">
          <Icon name="fluent-emoji:coin" class="w-4 h-4 text-yellow-500" />
          <span>Or : {{ building.cost.gold.toLocaleString("fr-FR") }}</span>
        </li>
        <li
          v-for="(amount, resource) in filteredResourceCosts"
          :key="resource"
          class="flex items-center gap-1"
        >
          <Icon
            :name="getResourceIcon(resource)"
            class="w-4 h-4"
            :class="getResourceColor(resource)"
          />
          <span>{{ getResourceLabel(resource) }} : {{ amount }}</span>
        </li>
      </ul>
    </div>

    <div v-if="hasProduction" class="mb-2">
      <div class="text-xs font-semibold mb-1">Production :</div>
      <ul class="text-xs flex flex-col gap-1">
        <li
          v-for="(amount, resource) in produced"
          :key="resource"
          class="flex items-center gap-1"
        >
          <Icon
            :name="getResourceIcon(resource)"
            class="w-4 h-4"
            :class="getResourceColor(resource)"
          />
          <span>{{ getResourceLabel(resource) }} : +{{ amount }}</span>
        </li>
      </ul>
    </div>

    <div v-if="hasMaintenance" class="mb-2">
      <div class="text-xs font-semibold mb-1">Entretien :</div>
      <ul class="text-xs flex flex-col gap-1">
        <li
          v-for="(amount, resource) in maintenance"
          :key="resource"
          class="flex items-center gap-1"
        >
          <Icon
            :name="
              resource === 'gold'
                ? 'fluent-emoji:coin'
                : getResourceIcon(resource)
            "
            class="w-4 h-4"
            :class="
              resource === 'gold'
                ? 'text-yellow-500'
                : getResourceColor(resource)
            "
          />
          <span>{{ getResourceLabel(resource) }} : {{ Math.abs(amount) }}</span>
        </li>
      </ul>
    </div>

    <div v-if="building.requires?.buildings?.length">
      <div class="text-xs font-semibold mb-1">Pré-requis :</div>
      <ul class="text-xs list-disc list-inside">
        <li v-for="req in building.requires.buildings" :key="req">
          {{ getBuildingName(req) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  building: { type: Object, required: true },
  buildingConfig: { type: Object, default: null },
});

// Image
const imageSrc = computed(() =>
  props.building?.code ? `/images/${props.building.code}.png` : null
);

// Filtrage des ressources autres que l'or
const filteredResourceCosts = computed(() => {
  const all = props.building.requires?.resources || {};
  const { gold, ...rest } = all;
  return rest;
});

const hasResourceCosts = computed(
  () => Object.keys(filteredResourceCosts.value).length > 0
);

// Séparer production et entretien
const produced = computed(() => {
  if (!props.building?.income) return {};
  return Object.fromEntries(
    Object.entries(props.building.income).filter(([_, v]) => v > 0)
  );
});

const maintenance = computed(() => {
  if (!props.building?.income) return {};
  return Object.fromEntries(
    Object.entries(props.building.income).filter(([_, v]) => v < 0)
  );
});

const hasProduction = computed(() => Object.keys(produced.value).length > 0);
const hasMaintenance = computed(
  () => Object.keys(maintenance.value).length > 0
);

// Fonctions d’affichage
function getBuildingName(code) {
  const config = props.buildingConfig;
  if (!config?.categories) return code;
  for (const category of config.categories) {
    const found = category.buildings.find((b) => b.code === code);
    if (found) return found.name;
  }
  return code;
}

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
    gold: "fluent-emoji:coin", // fallback, déjà géré séparément
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
    gold: "text-yellow-500",
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
    gold: "Or",
  };
  return labels[resource] || resource;
}
</script>
