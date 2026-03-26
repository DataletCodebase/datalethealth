// frontend/web/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    react(),

    // 🔹 PWA Plugin (added safely — does NOT affect API proxy)
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      // Check for updates every 1 hour (fallback)
      onRegistered(r) {
        if (r) setInterval(() => r.update(), 60 * 60 * 1000);
      },
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Kidney Health App",
        short_name: "KidneyApp",
        start_url: "/app/",
        display: "standalone",
        background_color: "#0b1220",
        theme_color: "#0ea5e9",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],

  // 🔹 API proxies
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true
      },
      "/diet": { target: "http://localhost:8000", changeOrigin: true },
      "/ask": { target: "http://localhost:8000", changeOrigin: true },
      "/water-logs": { target: "http://localhost:8000", changeOrigin: true },
      "/patient": { target: "http://localhost:8000", changeOrigin: true },
      "/leads": { target: "http://localhost:8000", changeOrigin: true },
      "/lab-report": { target: "http://localhost:8000", changeOrigin: true },
      "/chat-memory": { target: "http://localhost:8000", changeOrigin: true },
      "/meal-tracking": { target: "http://localhost:8000", changeOrigin: true },
      "/uploads": { target: "http://localhost:8000", changeOrigin: true }
    }
  }
  //   server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:4000",
  //       changeOrigin: true,
  //       rewrite: path => path.replace(/^\/api/, "")
  //     }
  //   }
  // }
});
