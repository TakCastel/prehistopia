<template>
  <div
    v-if="currentStep"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div
      class="bg-[#FFF9EE] max-w-md w-full p-6 rounded-lg shadow-xl border border-[#D9C2A6] relative text-[#4B3A29] flex flex-col items-stretch overflow-y-auto max-h-[80vh]"
    >
      <h2 class="text-2xl font-bold mb-2">{{ currentStep.title }}</h2>
      <p class="text-sm italic mb-4">{{ currentStep.flavorText }}</p>

      <div
        class="w-full min-h-40 aspect-video overflow-hidden rounded border border-[#CBB393] mb-4"
      >
        <img
          :src="currentStep.image"
          alt="Illustration"
          class="w-full h-full object-cover"
        />
      </div>

      <p class="text-base mb-6">{{ currentStep.explanation }}</p>

      <!-- 🧭 Zone des boutons en bas -->
      <div class="flex justify-between gap-4 mt-auto pt-4">
        <button
          class="bg-[#E9DCCF] text-[#4E3B31] py-2 px-4 rounded border border-[#3B2A21] hover:brightness-105 transition w-1/2"
          @click="skipAllTutorials"
        >
          Passer le tutoriel
        </button>

        <button
          class="bg-[#4E3B31] text-white py-2 px-4 rounded border border-[#3B2A21] hover:brightness-110 transition w-1/2"
          @click="dismissCurrentStep"
        >
          OK
        </button>
      </div>

      <!-- ❌ Bouton fermer -->
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
import { ref, computed, onBeforeUnmount } from "vue";
import { useMapStore } from "@/stores/useMapStore";
import rawSteps from "@/assets/data/tutorialSteps.json";

let resetHandler;

if (typeof window !== "undefined") {
  resetHandler = () => {
    seenSteps.value = new Set();
    localStorage.removeItem("seenTutorialSteps");
  };
  window.addEventListener("tutorial:reset", resetHandler);
}

onBeforeUnmount(() => {
  if (typeof window !== "undefined" && resetHandler) {
    window.removeEventListener("tutorial:reset", resetHandler);
  }
});

const mapStore = useMapStore();
const seenSteps = ref(new Set());

// Charge les étapes depuis localStorage
if (typeof window !== "undefined") {
  const saved = JSON.parse(localStorage.getItem("seenTutorialSteps") || "[]");
  seenSteps.value = new Set(saved);
}

// Reset via événement global
if (typeof window !== "undefined") {
  const saved = JSON.parse(localStorage.getItem("seenTutorialSteps") || "[]");
  seenSteps.value = new Set(saved);

  window.addEventListener("tutorial:reset", () => {
    seenSteps.value = new Set();
    localStorage.removeItem("seenTutorialSteps");
  });
}

function dismissCurrentStep() {
  if (currentStep.value) {
    seenSteps.value.add(currentStep.value.id);
    localStorage.setItem(
      "seenTutorialSteps",
      JSON.stringify([...seenSteps.value])
    );
  }
}

// Interprétation des conditions depuis le JSON
function evalCheck(expr, counts) {
  if (expr === "ALWAYS") return true;
  const match = expr.match(/^(\w+)\s*(>=?)\s*(\d+)$/);
  if (!match) return false;
  const [, building, op, value] = match;
  const count = counts[building] || 0;
  return op === ">=" ? count >= +value : count > +value;
}

const tutorialSteps = rawSteps.map((step) => ({
  ...step,
  condition: () => {
    const buildings = mapStore.map.flat().map((cell) => cell.building);
    const counts = buildings.reduce((acc, b) => {
      if (!b) return acc;
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {});
    if (step.check.includes("AND")) {
      return step.check
        .split("AND")
        .every((expr) => evalCheck(expr.trim(), counts));
    }
    return evalCheck(step.check, counts);
  },
}));

function skipAllTutorials() {
  tutorialSteps.forEach((step) => seenSteps.value.add(step.id));
  localStorage.setItem(
    "seenTutorialSteps",
    JSON.stringify([...seenSteps.value])
  );
}

const currentStep = ref(null);

let lastStepId = null;

watchEffect(async () => {
  if (!mapStore.map || mapStore.map.length === 0) return;

  for (const step of tutorialSteps) {
    if (!seenSteps.value.has(step.id) && step.condition()) {
      if (step.id !== lastStepId) {
        lastStepId = step.id;

        // ⏳ Ajoute un délai conditionnel selon l'étape
        if (step.check !== "ALWAYS") {
          currentStep.value = null;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }

        currentStep.value = step;
      }
      return;
    }
  }

  currentStep.value = null;
});

watch(currentStep, (step) => {
  if (step) {
    mapStore.selectedBuilding = null;
  }
});
</script>
