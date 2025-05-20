<template>
  <div
    class="fixed top-[44px] right-16 h-full w-48 bg-[#3B2A21] text-white p-2 z-50 border-l border-[#2E211B] flex flex-col gap-2 shadow-lg"
  >
    <ActionButton
      v-for="building in category.buildings"
      :key="building.name"
      :building="building"
      :building-config="buildingConfig"
      @click="() => handleSelect(building)"
    />
  </div>
</template>

<script setup>
import ActionButton from "@/components/ActionButton.vue";
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
