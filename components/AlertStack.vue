<template>
  <div
    class="fixed top-[52px] left-1/2 transform -translate-x-1/2 z-[9999] px-2 py-1"
  >
    <transition-group name="fade" tag="div" class="flex flex-col gap-3">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="relative flex items-center gap-1 px-4 py-2 pr-10 rounded shadow-sm text-sm font-medium max-w-sm mx-auto select-none bg-[#6B4F3A] text-white"
      >
        <Icon
          name="mdi:alert-circle-outline"
          class="text-white text-base shrink-0"
        />
        <span>{{ alert.message }}</span>
        <button
          class="absolute top-1 right-2 text-base leading-none text-white"
          @click="remove(alert.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useAlertStore } from "@/stores/useAlertStore";
const { alerts, remove } = useAlertStore();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
