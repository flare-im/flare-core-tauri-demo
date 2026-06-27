import path from "node:path";
import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { createFlareCoreWebAppViteConfig } from "flare-core-typescript-sdk/devtools/vite";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../../..");
const typeScriptSdkRoot = path.resolve(__dirname, "../../packages/flare-core-typescript-sdk/src");
const flareCoreDevCaCertPath = path.resolve(monorepoRoot, "flare-im-core/certs/server.crt");

function defineFlareTauriConfig(configFactory: (context: { mode: string }) => Record<string, unknown>): unknown {
  return defineConfig((context) => {
    const baseConfig = configFactory(context) as Record<string, unknown> & {
      define?: Record<string, unknown>;
    };
    return {
      ...baseConfig,
      define: {
        ...(baseConfig.define ?? {}),
        __FLARE_DEV_CA_CERT_PATH__: JSON.stringify(flareCoreDevCaCertPath),
      },
    };
  });
}

export default createFlareCoreWebAppViteConfig({
  appDir: __dirname,
  serverPort: 1432,
  defineConfig: defineFlareTauriConfig,
  loadEnv,
  vuePlugin: vue,
  extraAliases: [
    {
      find: "flare-core-typescript-sdk/transport",
      replacement: path.join(typeScriptSdkRoot, "adapters/_shared/transportProfile.ts"),
    },
    {
      find: "flare-core-typescript-sdk/tauri",
      replacement: path.join(typeScriptSdkRoot, "adapters/tauri/index.ts"),
    },
  ],
});
