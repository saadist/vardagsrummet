const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: "dist/bundle.js",
  sourcemap: true,
  minify: false,
  platform: "browser",
  target: ["es2020"],
  watch: process.argv.includes("--watch"),
}).catch(() => process.exit(1));