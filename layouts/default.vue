<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Barre de menu en haut -->
    <header
      class="z-10 fixed w-full bg-[#6B4F3A] text-white flex items-center justify-between px-4 py-2 shadow"
    >
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-bold">Prehistopia</h1>
        <RestartButton />
      </div>

      <ResourceDisplay />
    </header>

    <ResourcePanel />

    <TutorialOverlay />

    <!-- Zone principale (Grille de jeu) -->
    <main
      class="flex-grow flex items-center justify-center mt-[44px] mr-[64px]"
    >
      <slot />
    </main>

    <!-- Menu d'actions à droite -->
    <ActionMenu />
  </div>
</template>
