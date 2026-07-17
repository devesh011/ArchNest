import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    VitePWA({
      outDir: "build/client",
      injectRegister: null,
      registerType: "autoUpdate",
      includeAssets: ["icon-32.png", "icon-16.png", "icon-180.png"],
      manifest: {
        name: "ArchNest",
        short_name: "ArchNest",
        description:
          "Turn 2D floor plans into fully rendered 3D spaces with AI.",
        theme_color: "#0d9488",
        background_color: "#f5f2ee",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Start Building",
            short_name: "Upload",
            url: "/#upload",
            description: "Upload a floor plan and generate a 3D space",
            icons: [
              {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "My Projects",
            short_name: "Projects",
            url: "/#projects",
            description: "View your saved projects",
            icons: [
              {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "Pricing",
            url: "/pricing",
            description: "View pricing plans",
            icons: [
              {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
      },
      workbox: {
        // Keep this conservative — ArchNest depends on live Puter API
        // calls (auth, KV, AI generation, hosting), which should
        // always hit the network, not be served from a stale cache.
        // This just caches the app shell assets (JS/CSS/icons) for
        // fast reloads, not your dynamic data.
        globPatterns: ["**/*.{js,css,svg,png,ico}"],
        navigateFallback: null, // no static index.html exists in SSR builds — see build notes
        runtimeCaching: [], // no API caching — always go to network for Puter calls
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
