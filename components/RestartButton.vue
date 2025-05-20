<template>
  <button
    class="bg-[#4E3B31] hover:bg-[#3B2B24] text-white px-3 py-1 rounded transition-colors text-sm"
    @click="showModal = true"
  >
    Recommencer
  </button>

  <!-- Modale de confirmation -->
  <div
    v-if="showModal"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  >
    <div
      class="bg-[#3B2A21] text-white p-6 rounded-lg shadow-lg border border-[#2E211B] w-1/3 text-center"
    >
      <h2 class="text-lg font-bold mb-4 text-orange-300">Attention</h2>
      <p class="mb-6 text-gray-300">
        Êtes-vous sûr de vouloir tout supprimer et recommencer ?
      </p>
      <div class="flex justify-center gap-4">
        <button
          class="bg-[#8B3E2F] hover:bg-[#732F24] text-white px-4 py-2 rounded transition-colors"
          @click="confirmRestart"
        >
          Oui, tout supprimer
        </button>
        <button
          class="bg-[#4E3B31] hover:bg-[#3B2B24] text-white px-4 py-2 rounded transition-colors"
          @click="showModal = false"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useResourceStore } from "@/stores/useResourceStore";
import { useMapStore } from "@/stores/useMapStore";

const showModal = ref(false);

const resourceStore = useResourceStore();
const mapStore = useMapStore();

function confirmRestart() {
  // 🪙 Reset des ressources
  resourceStore.resetResources();

  // 🗺️ Reset de la map
  mapStore.selectedBuilding = null;
  mapStore.generateMap();
  mapStore.saveMap();

  // (Optionnel) Reset de la caméra si tu veux recentrer la vue :
  mapStore.camera.x = 0;
  mapStore.camera.y = 0;

  showModal.value = false;

  console.log("🔄 Game restarted!");

  setTimeout(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("seenTutorialSteps");
      window.dispatchEvent(new Event("tutorial:reset"));
    }
  }, 1000);
}
</script>
