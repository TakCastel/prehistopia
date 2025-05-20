<template>
  <button
    :disabled="!isBuildable"
    :class="[
      'w-full p-2 text-left rounded shadow-sm flex items-center gap-2 transition-colors border',
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

      <span
        v-if="unmetBuildingRequirements.length"
        class="text-xs text-[#D7BFA5] italic mt-1"
      >
        Nécessite :
        <span v-for="(req, index) in unmetBuildingRequirements" :key="req">
          {{ getBuildingName(req)
          }}<span v-if="index < unmetBuildingRequirements.length - 1">, </span>
        </span>
      </span>

      <!-- Coût et Ressources -->
      <div class="flex flex-wrap items-center gap-2 mt-1">
        <!-- Or -->
        <span class="text-xs text-[#D7BFA5] flex items-center gap-1">
          <span
            class="w-5 h-5 rounded-full bg-[#2E211B] flex items-center justify-center"
          >
            <Icon name="fluent-emoji:coin" class="w-3.5 h-3.5" />
          </span>
          <span>{{ building.cost.gold }}</span>
        </span>

        <!-- Autres ressources -->
        <span
          v-for="(amount, resource) in building.requires?.resources || {}"
          :key="resource"
          :class="[
            'text-xs flex items-center gap-1',
            resourceStore[resource] >= amount
              ? 'text-[#D7BFA5]'
              : 'text-red-500',
          ]"
        >
          <span
            class="w-5 h-5 rounded-full bg-[#2E211B] flex items-center justify-center"
          >
            <Icon :name="getResourceIcon(resource)" class="w-3.5 h-3.5" />
          </span>
          <span>{{ amount }}</span>
        </span>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useMapStore } from "@/stores/useMapStore";
import { useResourceStore } from "@/stores/useResourceStore";

const props = defineProps({
  building: { type: Object, required: true },
  buildingConfig: { type: Object, required: true }, // 👈 On récupère la config JSON ici
});

const emit = defineEmits(["click"]);

const mapStore = useMapStore();
const resourceStore = useResourceStore();

const unmetBuildingRequirements = computed(() => {
  const placedBuildings = mapStore.getPlacedBuildings?.() || [];
  return (
    props.building.requires?.buildings?.filter(
      (code) => !placedBuildings.includes(code)
    ) || []
  );
});

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

function getBuildingName(code) {
  const config = props.buildingConfig;
  if (!config || !config.categories) return code;

  for (const category of config.categories) {
    const found = category.buildings.find((b) => b.code === code);
    if (found) return found.name;
  }
  return code;
}

function hasRequiredBuildings(requires) {
  if (!requires?.buildings) return true;
  const placedBuildings = mapStore.getPlacedBuildings?.() || [];
  return requires.buildings.every((code) => placedBuildings.includes(code));
}

function hasRequiredResources(requires) {
  if (!requires?.resources) return true;
  return Object.entries(requires.resources).every(
    ([resource, amount]) => resourceStore[resource] >= amount
  );
}

const canAfford = computed(
  () => resourceStore.gold >= props.building.cost.gold
);
const hasPrerequisites = computed(() => {
  const requires = props.building.requires;
  return hasRequiredBuildings(requires) && hasRequiredResources(requires);
});
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
