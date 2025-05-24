<template>
  <div
    v-if="currentStep"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div
      class="bg-[#FFF9EE] max-w-md w-full p-6 rounded-lg shadow-xl border border-[#D9C2A6] relative text-[#4B3A29] flex flex-col items-stretch"
      style="max-height: 80vh"
    >
      <!-- Zone scrollable -->
      <div
        class="overflow-y-auto pr-3 custom-scrollbar"
        style="max-height: calc(80vh - 100px)"
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

        <p class="text-base whitespace-pre-line mb-4">
          {{ currentStep.explanation }}
        </p>
      </div>

      <!-- Boutons toujours visibles -->
      <div class="flex justify-between gap-4 pt-4">
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

      <!-- Bouton de fermeture -->
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
import {
  ref,
  computed,
  watch,
  watchEffect,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useMapStore } from "@/stores/useMapStore";
import { useResourceStore } from "@/stores/useResourceStore";
import rawSteps from "@/assets/data/tutorialSteps.json";

const mapStore = useMapStore();
const resourceStore = useResourceStore();
const seenSteps = ref(new Set());
const currentStep = ref(null);
let lastStepId = null;

// ⏪ Fonction de reset réutilisable
function resetTutorial() {
  seenSteps.value = new Set();
  localStorage.removeItem("seenTutorialSteps");
  currentStep.value = tutorialSteps.find((s) => s.check === "ALWAYS") || null;
}

// Écoute de l’événement global pour reset
onMounted(() => {
  const saved = JSON.parse(localStorage.getItem("seenTutorialSteps") || "[]");
  seenSteps.value = new Set(saved);
  window.addEventListener("tutorial:reset", resetTutorial);
});

onBeforeUnmount(() => {
  window.removeEventListener("tutorial:reset", resetTutorial);
});

function dismissCurrentStep() {
  if (currentStep.value) {
    seenSteps.value.add(currentStep.value.id);
    localStorage.setItem(
      "seenTutorialSteps",
      JSON.stringify([...seenSteps.value])
    );
  }
}

function skipAllTutorials() {
  tutorialSteps.forEach((step) => seenSteps.value.add(step.id));
  localStorage.setItem(
    "seenTutorialSteps",
    JSON.stringify([...seenSteps.value])
  );
}

function evalCheck(expr, counts) {
  if (expr === "ALWAYS") return true;

  const match = expr.match(/^(\w+)\s*(<=|>=|==|!=|<|>)\s*(-?\d+)$/);
  if (!match) return false;

  const [, key, op, value] = match;
  const num = Number(value);

  const val =
    resourceStore[key] !== undefined ? resourceStore[key] : counts[key] || 0;

  switch (op) {
    case ">=":
      return val >= num;
    case "<=":
      return val <= num;
    case ">":
      return val > num;
    case "<":
      return val < num;
    case "==":
      return val === num;
    case "!=":
      return val !== num;
    default:
      return false;
  }
}

// Enrichit les steps avec leur condition d’apparition
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

// 🔄 Vérifie si un nouveau step est dispo
watchEffect(async () => {
  if (!mapStore.map || mapStore.map.length === 0) return;

  for (const step of tutorialSteps) {
    if (!seenSteps.value.has(step.id) && step.condition()) {
      if (step.id !== lastStepId) {
        lastStepId = step.id;

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

// 👋 On annule la sélection de bâtiment pendant le tuto
watch(currentStep, (step) => {
  if (step) {
    mapStore.selectedBuilding = null;
  }
});
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbb393 #fff9ee;
}

/* Chrome, Safari, Edge */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
  background: #fff9ee;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #fff9ee;
  border-left: 1px solid #d9c2a6;
  border-radius: 0 8px 8px 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbb393;
  border-radius: 8px;
  border: 2px solid #fff9ee;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a57f3b;
}
</style>
