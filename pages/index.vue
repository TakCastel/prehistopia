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

      <!-- Bandeau DEMO penché sous le logo -->
      <div
        class="absolute bottom-8 right-0 rotate-12 bg-[#FF3B3B] text-white text-xs font-bold px-2 py-1 rounded shadow animate-pulse-smooth pointer-events-none select-none"
      >
        DEMO
      </div>
    </div>

    <!-- Contenu centré -->
    <div class="flex-grow flex flex-col items-center justify-start px-6 mt-8">
      <h1 class="text-3xl font-bold mb-2 tracking-wide text-center">
        Après le cataclysme...
      </h1>

      <p
        class="text-sm italic text-[#D9C2A6] mb-8 text-center max-w-md leading-relaxed"
      >
        Votre tribu a survécu aux flammes et aux cendres. Le vieux monde s’est
        écroulé, ne laissant que ruines et désolation. Il vous faut maintenant
        repartir à zéro. Quelle sera votre destination ?
      </p>

      <div class="flex flex-col sm:flex-row gap-6 mb-6">
        <!-- Bouton actif -->
        <NuxtLink
          to="/play"
          class="flex flex-col items-center font-semibold rounded-xl p-4 w-48 text-[#FFF9EE] shadow-md transition-all duration-200 bg-[#1A1A1A] border-2 border-[#4CAF50] hover:border-[#388E3C] hover:scale-105"
        >
          <img
            src="/images/tree.png"
            alt="Plaines"
            class="w-16 h-16 object-contain mb-2"
          />
          <span class="text-base text-center">Plaines</span>
        </NuxtLink>

        <!-- Boutons grisés -->
        <div
          class="flex flex-col items-center font-semibold rounded-xl p-4 w-48 text-[#999] shadow-md bg-[#1A1A1A] border-2 border-[#666] opacity-50 cursor-not-allowed"
        >
          <img
            src="/images/palmtree.png"
            alt="Oasis"
            class="w-16 h-16 object-contain mb-2"
          />
          <span class="text-base text-center">Oasis</span>
        </div>

        <div
          class="flex flex-col items-center font-semibold rounded-xl p-4 w-48 text-[#999] shadow-md bg-[#1A1A1A] border-2 border-[#666] opacity-50 cursor-not-allowed"
        >
          <img
            src="/images/pinetree.png"
            alt="Lacs gelés"
            class="w-16 h-16 object-contain mb-2"
          />
          <span class="text-base text-center">Lacs gelés</span>
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
