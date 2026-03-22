import { defineConfig } from "@sugarcube-sh/cli";

export default defineConfig({
  resolver: "./src/components/design-tokens/tokens.resolver.json",
  output: {
    cssRoot: "src/components/styles",
    variables: "src/components/styles/global",
    utilities: "src/components/styles/utilities",
    cube: "src/components/styles",
    components: "src/components/bits",
  },
});
