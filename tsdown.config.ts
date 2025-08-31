import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  platform: "node",
  target: "node22",
  clean: true,
  dts: false,
  sourcemap: true,
  minify: true,
  // Bundle everything except @aws-sdk/* which is provided by the Lambda runtime
  noExternal: /^(?!@aws-sdk\/).*/,
  env: {
    NODE_ENV: "production",
  },
});
