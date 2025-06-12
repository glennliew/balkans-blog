import { defineConfig } from "vite";

export default defineConfig({
  base: "/balkans-blog/",
  server: {
    port: 4000,
    open: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true
  }
}); 