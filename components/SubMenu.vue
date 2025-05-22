<template>
  <div
    class="fixed top-[44px] right-16 h-full max-h-[calc(100vh-44px)] w-48 bg-[#3B2A21] text-white p-2 z-50 border-l border-[#2E211B] flex flex-col shadow-lg"
  >
    <div class="font-bold text-[#EEDFC6] mb-1">
      {{ category.name }}
    </div>

    <!-- Zone scrollable ici -->
    <div
      class="flex-1 overflow-y-auto flex flex-col gap-2 touch-auto overscroll-contain"
    >
      <BuildingButton
        v-for="building in category.buildings"
        :key="building.name"
        :building="building"
        :building-config="buildingConfig"
        @click="() => handleSelect(building)"
      />
    </div>
  </div>
</template>

<script setup>
import buildingConfig from "@/assets/data/buildings.json";
import { useMapStore } from "@/stores/useMapStore";

const mapStore = useMapStore();

defineProps({
  category: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

function handleSelect(building) {
  mapStore.selectBuildingForPlacement(building.code);
  emit("close");
}
</script>
