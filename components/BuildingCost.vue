<template>
  <div class="flex flex-wrap items-center gap-2 mt-1">
    <!-- Coquillages -->
    <span
      class="text-xs flex items-center gap-1"
      :class="
        resourceStore.gold >= building.cost.gold
          ? 'text-[#D7BFA5]'
          : 'text-red-500'
      "
    >
      <span
        class="w-5 h-5 rounded-full bg-[#2E211B] flex items-center justify-center"
      >
        <Icon name="fluent-emoji:spiral-shell" class="w-3.5 h-3.5" />
      </span>
      <span>{{ building.cost.gold.toLocaleString("fr-FR") }}</span>
    </span>

    <!-- Autres ressources -->
    <span
      v-for="(amount, resource) in building.requires?.resources || {}"
      :key="resource"
      :class="[
        'text-xs flex items-center gap-1',
        resourceStore[resource] >= amount ? 'text-[#D7BFA5]' : 'text-red-500',
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
</template>

<script setup>
import { useResourceStore } from "@/stores/useResourceStore";

const props = defineProps({
  building: Object,
  getResourceIcon: Function,
});

const resourceStore = useResourceStore();
</script>
