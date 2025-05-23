<template>
  <div class="min-h-screen bg-[#1A1A1A] text-[#FFF9EE] p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Mentions légales</h1>

    <p class="mb-2 text-sm">
      Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la
      confiance dans l’économie numérique, il est précisé aux utilisateurs du
      site <strong>Prehistopia</strong> l’identité des différents intervenants
      dans le cadre de sa réalisation et de son suivi.
    </p>

    <h2 class="text-lg font-semibold mt-6 mb-2">Éditeur du site</h2>
    <p class="text-sm mb-2">
      Ce site est édité par : <br />
      <strong>Nom ou pseudonyme</strong><br />
      Adresse ou ville (facultatif)<br />
      Contact : ton@email.com
    </p>

    <h2 class="text-lg font-semibold mt-6 mb-2">Hébergement</h2>
    <p class="text-sm mb-2">
      Le site est hébergé par :<br />
      <strong>Nom de l’hébergeur</strong><br />
      Adresse ou site web de l’hébergeur
    </p>

    <h2 class="text-lg font-semibold mt-6 mb-2">Propriété intellectuelle</h2>
    <p class="text-sm mb-2">
      Tous les éléments graphiques, textes, illustrations et contenus présents
      sur ce site sont, sauf mentions contraires, la propriété exclusive de
      l’éditeur et ne peuvent être reproduits sans autorisation.
    </p>

    <h2 class="text-lg font-semibold mt-6 mb-2">Responsabilité</h2>
    <p class="text-sm mb-2">
      L’éditeur du site ne saurait être tenu responsable des dommages directs ou
      indirects pouvant résulter de l’accès ou de l’utilisation du site par
      l’utilisateur.
    </p>

    <NuxtLink
      to="/"
      class="mt-8 inline-block text-sm text-[#D9C2A6] underline hover:text-white"
    >
      ← Retour à l'accueil
    </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({ layout: "blank" });
</script>
