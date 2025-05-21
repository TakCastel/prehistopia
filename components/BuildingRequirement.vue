<template>
  <span v-if="requirements.length" class="text-xs text-[#D7BFA5] italic mt-1">
    Nécessite :
    <span v-for="(req, index) in requirements" :key="req">
      {{ getBuildingName(req) }}
      <span v-if="index < requirements.length - 1">, </span>
    </span>
  </span>
</template>

<script setup>
const props = defineProps({
  requirements: Array,
  getBuildingName: Function,
});
</script>
