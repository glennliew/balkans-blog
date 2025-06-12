import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  publicDir: "public",
  server: {
    port: 4000,
    open: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Ensure all assets get proper paths
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|mp4|webm|ogg)$/i.test(assetInfo.name)) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
}); 