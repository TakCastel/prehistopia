<template>
  <button
    :class="[
      'flex flex-col items-center font-semibold rounded-xl p-4 w-48 text-[#FFF9EE] shadow-md transition-all duration-200 bg-[#1A1A1A] border-2',
      borderColors[props.type],
      hoverColors[props.type],
      'hover:scale-105',
    ]"
    @click="() => chooseBiome(props.type)"
  >
    <img
      :src="props.image"
      :alt="props.name"
      class="w-16 h-16 object-contain mb-2"
    />
    <span class="text-base text-center">{{ props.name }}</span>
  </button>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  type: String,
  name: String,
  image: String,
});

const router = useRouter();

function chooseBiome(type) {
  router.push({ path: "/play", query: { biome: type } });
}

const borderColors = {
  classic: "border-[#4CAF50]",
  desert: "border-[#FFB300]",
  snow: "border-[#03A9F4]",
};

const hoverColors = {
  classic: "hover:border-[#388E3C]",
  desert: "hover:border-[#F57C00]",
  snow: "hover:border-[#0288D1]",
};
</script>
