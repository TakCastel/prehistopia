<template>
  <div
    v-if="currentStep"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div
      class="bg-[#FFF9EE] max-w-md w-full p-6 rounded-lg shadow-xl border border-[#D9C2A6] relative text-[#4B3A29]"
    >
      <h2 class="text-2xl font-bold mb-2">{{ currentStep.title }}</h2>
      <p class="text-sm italic mb-4">{{ currentStep.flavorText }}</p>
      <img
        :src="currentStep.image"
        alt="Illustration"
        class="w-full h-auto rounded border border-[#CBB393] mb-4"
      />
      <p class="text-base">{{ currentStep.explanation }}</p>

      <button
        class="absolute top-2 right-2 text-sm text-gray-500 hover:text-black"
        @click="dismissCurrentStep"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useMapStore } from "@/stores/useMapStore";

const mapStore = useMapStore();
const seenSteps = ref(new Set());

const tutorialSteps = [
  {
    id: "start",
    condition: () => true,
    title: "Bienvenue dans votre nouvelle terre",
    flavorText:
      "Les anciens racontent qu’un foyer allumé attire les esprits protecteurs.",
    image: "/images/tutorial/start_fire.png", // 👉 mets l’image correspondante ici
    explanation:
      "Clique sur les icônes à droite de l’écran, choisis “Feu de camp” et place-le sur la carte dans une zone dégagée.",
  },
  {
    id: "afterCampfire",
    condition: () => mapStore.getPlacedBuildings().includes("campfire"),
    title: "Vous avez découvert le feu !",
    flavorText: "Le feu est le cœur battant des premières tribus.",
    image: "/images/tutorial/fire_unlocked.png", // 👉 mets l’image correspondante ici
    explanation:
      "Le feu est le centre de votre civilisation. Vous pouvez maintenant construire des maisons autour du feu, dans sa zone de délimitation.",
  },
];

const currentStep = computed(() => {
  return tutorialSteps.find(
    (step) => step.condition() && !seenSteps.value.has(step.id)
  );
});

function dismissCurrentStep() {
  if (currentStep.value) {
    seenSteps.value.add(currentStep.value.id);
  }
}
</script>
