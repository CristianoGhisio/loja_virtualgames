import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const securityPlugin = require("eslint-plugin-security");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  securityPlugin.configs.recommended,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".cleanup-backup/**",
    "scripts/*.js",
  ]),
]);

export default eslintConfig;
