<template>
  <div
    class="min-h-screen bg-[#1A1A1A] text-[#FFF9EE] flex flex-col items-center"
  >
    <!-- Logo en haut -->
    <div class="flex flex-col items-center pt-6 relative">
      <img
        src="/images/logo-prehistopia.png"
        alt="Logo Prehistopia"
        class="w-64 h-auto"
      />

      <div
        class="absolute bottom-8 right-0 rotate-12 bg-[#FF3B3B] text-white text-xs font-bold px-2 py-1 rounded shadow animate-pulse-smooth pointer-events-none select-none"
      >
        DEMO
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-grow flex flex-col items-center justify-start px-6 mt-8">
      <div v-if="isLoading" class="text-sm italic text-[#D9C2A6] mt-6">
        Chargement en cours...
      </div>

      <div v-else>
        <h1 class="text-3xl font-bold mb-2 tracking-wide text-center">
          {{
            hasSavedMap ? "Votre tribu vous attend" : "Après le cataclysme..."
          }}
        </h1>

        <p
          class="text-sm italic text-[#D9C2A6] mb-8 text-center max-w-md leading-relaxed m-auto"
        >
          {{
            hasSavedMap
              ? "Vous avez déjà établi votre premier campement. Souhaitez-vous reprendre là où vous vous êtes arrêté ?"
              : "Votre tribu a survécu aux flammes et aux cendres. Le vieux monde s’est écroulé, ne laissant que ruines et désolation. Il vous faut maintenant repartir à zéro. Quelle sera votre destination ?"
          }}
        </p>

        <div
          v-if="!hasSavedMap"
          class="flex flex-col justify-center items-center sm:flex-row gap-6"
        >
          <BiomeCard type="classic" name="Plaines" image="/images/tree.png" />
          <BiomeCard type="desert" name="Oasis" image="/images/palmtree.png" />
          <BiomeCard
            type="snow"
            name="Lacs gelés"
            image="/images/pinetree.png"
          />
        </div>

        <div v-else class="flex flex-col justify-center sm:flex-row gap-6">
          <button
            class="flex flex-col items-center font-semibold rounded-xl p-4 w-48 text-[#FFF9EE] shadow-md transition-all duration-200 bg-[#1A1A1A] border-2 border-[#FFD86A] hover:bg-[#2E2E2E] hover:scale-105"
            @click="continueGame"
          >
            <img
              src="/images/meeple_f.png"
              alt="Continuer"
              class="w-16 h-16 object-contain mb-2"
            />
            <span class="text-base text-center">Continuer</span>
          </button>

          <RestartButton
            style-context="home"
            label="Recommencer"
            :on-reset="handleReset"
          />
        </div>
      </div>
    </div>

    <!-- Pied de page -->
    <footer class="w-full text-center text-xs text-[#D9C2A6] py-4 mt-12">
      © {{ new Date().getFullYear() }} Prehistopia ·
      <NuxtLink to="/mentions-legales" class="underline hover:text-white mx-1">
        Mentions légales
      </NuxtLink>
      ·
      <NuxtLink
        to="/conditions-utilisation"
        class="underline hover:text-white mx-1"
      >
        Conditions d'utilisation
      </NuxtLink>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import localforage from "localforage";
import { useRouter } from "vue-router";
import BiomeCard from "@/components/BiomeCard.vue";

const isLoading = ref(true);
const hasSavedMap = ref(false);

const router = useRouter();

async function checkSavedMap() {
  isLoading.value = true;
  const map = await localforage.getItem("map-data");
  hasSavedMap.value = Array.isArray(map) && map.length > 0;
  isLoading.value = false;
}

onMounted(() => {
  checkSavedMap();

  if (typeof window !== "undefined") {
    window.addEventListener("tutorial:reset", checkSavedMap);
  }
});

function continueGame() {
  router.push("/play");
}

function handleReset() {
  hasSavedMap.value = false;
  isLoading.value = true; // ← force le passage temporaire par l'état "Chargement..."
}
</script>

<style>
@keyframes pulse-smooth {
  0%,
  100% {
    transform: scale(1) rotate(-12deg);
  }
  50% {
    transform: scale(1.15) rotate(-12deg);
  }
}

.animate-pulse-smooth {
  animation: pulse-smooth 1.5s ease-in-out infinite;
}
</style>
