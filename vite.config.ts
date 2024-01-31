/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setupVitest.ts"],
  },
  resolve: {
    alias: {
      "~/app": path.resolve(__dirname, "./app"),
      "~/server": path.resolve(__dirname, "./server"),
    },
  },
});
