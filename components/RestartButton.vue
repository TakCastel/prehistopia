<template>
  <button
    class="bg-[#4E3B31] hover:bg-[#3B2B24] text-white px-3 py-1 rounded transition-colors text-sm"
    @click="showModal = true"
  >
    Recommencer
  </button>

  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div
      class="bg-[#FFF9EE] max-w-md w-full p-6 rounded-lg shadow-xl border border-[#D9C2A6] relative text-[#4B3A29] flex flex-col items-stretch"
    >
      <!-- Titre -->
      <h2 class="text-2xl font-bold mb-2 text-center">Tout recommencer ?</h2>

      <!-- Texte de confirmation -->
      <p class="text-sm italic mb-6 text-center">
        Cette action réinitialisera votre partie.<br />
        Vous perdrez tous vos bâtiments et ressources actuels.
      </p>

      <!-- 🧭 Boutons -->
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

      <!-- ❌ Bouton de fermeture -->
      <button
        class="absolute top-2 right-2 text-sm text-gray-500 hover:text-black"
        @click="showModal = false"
      >
        ✕
      </button>
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
