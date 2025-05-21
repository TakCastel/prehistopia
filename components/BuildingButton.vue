<template>
  <div class="relative group w-full">
    <button
      :disabled="!isBuildable"
      :class="[
        'w-full p-2 text-left rounded shadow-sm flex items-center gap-2 transition-colors border group/button',
        isBuildable
          ? 'bg-[#6B4F3A] hover:bg-[#4E3B31] cursor-pointer'
          : 'bg-[#2E211B] opacity-50 cursor-not-allowed',
        isSelected ? 'border-yellow-500' : 'border-transparent',
      ]"
      @click.stop="selectBuilding"
    >
      <Icon :name="building.icon" class="w-5 h-5" />
      <div class="flex flex-col">
        <span class="truncate text-sm">{{ building.name }}</span>

        <BuildingRequirement
          :requirements="unmetBuildingRequirements"
          :get-building-name="getBuildingName"
        />

        <BuildingCost
          :building="building"
          :get-resource-icon="getResourceIcon"
        />
      </div>
    </button>

    <!-- zone tampon invisible entre le bouton et la carte -->
    <div class="absolute right-full top-0 h-full w-6" />

    <!-- carte à gauche, reste visible tant qu'on survole elle OU le bouton OU la zone tampon -->
    <div
      class="invisible group-hover:visible absolute right-[calc(100%+.6rem)] top-0"
    >
      <BuildingCard :building="building" :building-config="buildingConfig" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useMapStore } from "@/stores/useMapStore";
import { useResourceStore } from "@/stores/useResourceStore";

import BuildingRequirement from "@/components/BuildingRequirement.vue";
import BuildingCost from "@/components/BuildingCost.vue";

const props = defineProps({
  building: { type: Object, required: true },
  buildingConfig: { type: Object, required: true },
});

const emit = defineEmits(["click"]);

const mapStore = useMapStore();
const resourceStore = useResourceStore();

function getBuildingName(code) {
  const config = props.buildingConfig;
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
  };
  return icons[resource] || "mdi:help-circle-outline";
}

const unmetBuildingRequirements = computed(() => {
  const placed = mapStore.getPlacedBuildings?.() || [];
  return (
    props.building.requires?.buildings?.filter(
      (code) => !placed.includes(code)
    ) || []
  );
});

const canAfford = computed(
  () => resourceStore.gold >= props.building.cost.gold
);

function hasRequiredBuildings(requires) {
  const placed = mapStore.getPlacedBuildings?.() || [];
  return requires?.buildings?.every((c) => placed.includes(c)) ?? true;
}

function hasRequiredResources(requires) {
  return Object.entries(requires?.resources || {}).every(
    ([res, amt]) => resourceStore[res] >= amt
  );
}

const hasPrerequisites = computed(
  () =>
    hasRequiredBuildings(props.building.requires) &&
    hasRequiredResources(props.building.requires)
);

const isBuildable = computed(() => canAfford.value && hasPrerequisites.value);
const isSelected = computed(
  () => mapStore.selectedBuilding === props.building.code
);

function selectBuilding() {
  if (!isBuildable.value) return;
  mapStore.selectBuildingForPlacement(props.building.code);
  emit("click");
}
</script>
