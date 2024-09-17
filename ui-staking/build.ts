#!/usr/bin/env ts-node

import esbuild from "esbuild";
import fs from "node:fs";
import config from "./esbuild.config.ts";
// import { copy } from "esbuild-plugin-copy";

async function main() {
  const metafile = await esbuild.build({
    ...config,
    define: {
      ...config.define,
      "process.env.NODE_ENV": "'production'",
    },
    plugins: [...(config.plugins ? config.plugins : [])],
    minify: true,
    treeShaking: true,
    metafile: true,
    splitting: true,
  });

  fs.writeFileSync("dist/metafile", JSON.stringify(metafile.metafile));

  console.log("Build complete");
}

main();
