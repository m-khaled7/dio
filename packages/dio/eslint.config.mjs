// @ts-check
import { defineConfig } from "eslint/config"; 
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { baseConfig } from "@dio/eslint-config";

export default defineConfig([
  {
    ignores: ["eslint.config.mjs", "dist/"],
  },

  {
    extends: [baseConfig],
    
  },

  // 3. Prettier Formatting Plugin (Always run last to overwrite style conflicts)
  eslintPluginPrettierRecommended,
]);
