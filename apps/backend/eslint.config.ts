import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

export default defineConfig([...medusa.configs.recommended,
    {
    rules: {
      // Disables a specific Medusa ecosystem rule globally
      "@medusajs/link-no-cross-module-relationship": "off",
      "@medusajs/no-duplicate-step-id-in-workflow": "off"
    },
  },
])
