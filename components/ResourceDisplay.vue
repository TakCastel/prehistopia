<template>
  <div class="flex items-center gap-4">
    <!-- Or -->
    <div class="flex items-center gap-1">
      <Icon name="fluent-emoji:spiral-shell" class="w-5 h-5" />
      <span class="text-sm">{{ gold.toLocaleString("fr-FR") }}</span>
    </div>

    <!-- Population -->
    <div class="flex items-center gap-1">
      <Icon name="mdi:account" class="w-5 h-5 text-white/80" />
      <span class="text-sm">{{ population.toLocaleString("fr-FR") }}</span>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useResourceStore } from "@/stores/useResourceStore";

const resourceStore = useResourceStore();
const { gold, population } = storeToRefs(resourceStore);
</script>
