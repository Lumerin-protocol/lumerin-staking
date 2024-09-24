import type { BuildOptions } from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import { copy } from "esbuild-plugin-copy";
import { getAndValidateEnv } from "./env.ts";

export default {
  logLevel: "info",
  entryPoints: ["src/index.html"],
  bundle: true,
  outdir: "dist",
  publicPath: "/", // Prepends "/" to all asset paths, making imports root-relative. Required for accessing assets from non-root paths.
  define: {
    ...getAndValidateEnv().full,
  },
  inject: ["./src/config/react-shim.ts"],
  plugins: [
    htmlPlugin(),
    copy({
      // Needed to copy some images to the output directory because esbuild-plugin-html doesn't handle them
      resolveFrom: "out",
      assets: {
        from: "./src/images/**/*",
        to: "./images/",
      },
    }),
    copy({
      resolveFrom: "out",
      assets: {
        from: "./src/.well-known/**/*",
        to: "./.well-known/",
      },
    }),
  ],
  assetNames: "/[dir]/[name]-[hash]",
  chunkNames: "[ext]/[name]-[hash]",
  // entryNames: "[dir]/[name]-[hash]",
  format: "esm",
  loader: {
    ".png": "file",
    ".webp": "file",
    ".woff": "file",
    ".woff2": "file",
    ".svg": "file",
  },
} as BuildOptions;
