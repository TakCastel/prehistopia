<template>
  <div>
    <button :class="buttonClass" @click="showModal = true">
      <template v-if="styleContext === 'home'">
        <img
          src="/images/ruin.png"
          alt="Recommencer"
          class="w-16 h-16 object-contain mb-2"
        />
        <span class="text-base text-center">{{ label }}</span>
      </template>
      <template v-else>
        {{ label }}
      </template>
    </button>

    <div
      v-show="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div
        class="bg-[#FFF9EE] max-w-md w-full p-6 rounded-lg shadow-xl border border-[#D9C2A6] relative text-[#4B3A29] flex flex-col items-stretch"
      >
        <h2 class="text-2xl font-bold mb-2 text-center">Tout recommencer ?</h2>
        <p class="text-sm italic mb-6 text-center">
          Cette action réinitialisera votre partie.<br />
          Vous perdrez tous vos bâtiments et ressources actuels.
        </p>

        <div class="flex justify-between gap-4 mt-auto pt-2">
          <button
            class="bg-[#E9DCCF] text-[#4E3B31] py-2 px-4 rounded border border-[#3B2A21] hover:brightness-105 transition w-1/2 text-sm"
            @click="showModal = false"
          >
            Annuler
          </button>

          <button
            class="bg-[#4E3B31] text-white py-2 px-4 rounded border border-[#3B2A21] hover:brightness-110 transition w-1/2 text-sm"
            @click="confirmRestart"
          >
            Oui, recommencer
          </button>
        </div>

        <button
          class="absolute top-2 right-2 text-sm text-gray-500 hover:text-black"
          @click="showModal = false"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import localforage from "localforage";
import { useResourceStore } from "@/stores/useResourceStore";
import { useMapStore } from "@/stores/useMapStore";
import { useMeepleStore } from "@/stores/useMeepleStore";

const props = defineProps({
  styleContext: { type: String, default: "menu" },
  label: { type: String, default: "Recommencer" },
  onReset: { type: Function, default: null },
});

const showModal = ref(false);

const resourceStore = useResourceStore();
const mapStore = useMapStore();
const meepleStore = useMeepleStore();
const router = useRouter();

function confirmRestart() {
  resourceStore.resetResources();
  mapStore.selectedBuilding = null;
  if (typeof window !== "undefined") {
    localforage.removeItem("map-data");
  }
  mapStore.map = [];
  meepleStore.resetMeeples();
  mapStore.camera.x = 0;
  mapStore.camera.y = 0;

  showModal.value = false;

  if (props.onReset) props.onReset();

  setTimeout(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("seenTutorialSteps");
      window.dispatchEvent(new Event("tutorial:reset"));
    }
  }, 2000);

  router.push("/");
}

const buttonClass = computed(() => {
  if (props.styleContext === "home") {
    return "flex flex-col items-center font-semibold rounded-xl p-4 w-48 text-[#FFF9EE] shadow-md transition-all duration-200 bg-[#2C1F1A] border-2 border-[#B9583C] hover:bg-[#3B2A21] hover:scale-105";
  }
  return "bg-[#4E3B31] hover:bg-[#3B2B24] text-white px-3 py-1 rounded transition-colors text-sm";
});
</script>
