import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: process.env.ORVAL_INPUT ?? "./openapi.yaml",
    },
    output: {
      target: "./src/generated/api/index.ts",
      schemas: "./src/generated/api/models",
      client: "axios",
      mode: "split",
      clean: true,
      override: {
        mutator: {
          path: "./src/lib/api-client.ts",
          name: "apiClient",
        },
      },
    },
  },
});
