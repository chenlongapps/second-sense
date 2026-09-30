import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    target: "es2020",
  },
  server: {
    port: 8080,
  },
  preview: {
    port: 4173,
  },
});
