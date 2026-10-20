/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Emits sw.js with a per-build identifier so each deployment triggers a service worker update.
function serviceWorker(): Plugin {
  const source = () => readFileSync(new URL("./sw/sw.js", import.meta.url), "utf8");
  return {
    name: "sommeilenor-sw",
    configureServer(server) {
      server.middlewares.use("/sw.js", (_req, res) => {
        res.setHeader("Content-Type", "text/javascript");
        res.end(source().replaceAll("__BUILD_ID__", "dev"));
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: source().replaceAll("__BUILD_ID__", Date.now().toString(36)),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serviceWorker()],
  server: {
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
