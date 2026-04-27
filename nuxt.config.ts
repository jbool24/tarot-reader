// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-20',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts'],
  fonts: {
    families: [
      { name: 'Cinzel Decorative', provider: 'google', weights: [400, 700, 900] },
      { name: 'Crimson Text', provider: 'google', weights: [400, 600, 700], styles: ['normal', 'italic'] },
    ],
  },
  app: {
    head: {
      title: 'Mystic Tarot Reader',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Consult the cards and reveal your destiny with our mystical AI-powered Tarot Reader.' },
      ],
    },
  },
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || '',
  },
  nitro: {
    preset: 'netlify',
  },
})
