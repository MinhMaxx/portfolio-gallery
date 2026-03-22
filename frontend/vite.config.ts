import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/demo": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
    },
    fs: {
      allow: [".", "../local-assets"],
    },
  },
  publicDir: "public",
});
