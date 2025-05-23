// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],

  app: {
    head: {
      title: "Préhistopia",
      meta: [
        {
          name: "description",
          content:
            "Préhistopia est un city builder néolithique où chaque bâtiment façonne la survie de votre tribu.",
        },
        { property: "og:title", content: "Préhistopia" },
        {
          property: "og:description",
          content:
            "Construisez un village, gérez vos ressources et guidez votre tribu à travers les âges.",
        },
        { property: "og:url", content: "https://prehistopia.vercel.app" },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://prehistopia.vercel.app/og-image.jpg",
        }, // Remplace ce chemin

        {
          name: "keywords",
          content:
            "city builder, néolithique, stratégie, survie, préhistoire, jeu de gestion, Nuxt 3",
        },
        { name: "author", content: "Équipe Préhistopia" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
});
