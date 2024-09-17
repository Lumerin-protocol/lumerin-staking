#!/usr/bin/env ts-node

import esbuild from "esbuild";
import config from "./esbuild.config.js";

async function main() {
  const ctx = await esbuild.context({
    ...config,
    define: {
      ...config.define,
      "process.env.NODE_ENV": "'development'",
    },
    metafile: true,
    write: true,
    plugins: [...(config.plugins ? config.plugins : [])],
  });

  await ctx.watch();

  const { host, port } = await ctx.serve({
    servedir: "dist",
    fallback: "dist/index.html",
  });

  console.log(`Serving on http://${host}:${port}`);
}

main();
