// frontend/web/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // 🔹 PWA Plugin (added safely — does NOT affect API proxy)
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true   // enable PWA during development
      },
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Kidney Health App",
        short_name: "KidneyApp",
        start_url: "/",
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

  // 🔹 your existing API proxy remains untouched
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, "")
      }
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
