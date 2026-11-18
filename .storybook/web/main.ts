import type { StorybookConfig } from "@storybook/react-vite"
import { rnw } from "vite-plugin-rnw"
import tsconfigPaths from "vite-tsconfig-paths"

const config: StorybookConfig = {
  typescript: { reactDocgen: false },
  stories: [
    "../../app/components/**/*.stories.?(ts|tsx|js|jsx)",
    "../../app/screens/**/*.stories.?(ts|tsx|js|jsx)",
    "../stories/**/*.stories.?(ts|tsx|js|jsx)",
  ],
  // Storybook 9 では actions / controls / docs 等は core へ統合されたため
  // addon-essentials / addon-links / addon-actions の登録は不要。
  addons: ["@storybook/addon-vitest", "storybook-dark-mode"],
  viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tsconfigPaths(), ...rnw()]

    return viteConfig
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
}

export default config
