import * as esbuild from "esbuild";

const games = [
    {
        name: "Textsnurr",
        entry: "src/textsnurr.ts",
        outfile: "public/textsnurr/bundle.js",
    },

    // Add more later:
    // {
    //   name: "mygame",
    //   entry: "src/mygame.ts",
    //   outfile: "public/mygame/bundle.js",
    // },
];

const contexts = [];

const isDev = process.env.NODE_ENV === "dev";

for (const game of games) {

    const config = {
        entryPoints: [game.entry],
        outfile: game.outfile,
        bundle: true,
        sourcemap: isDev,
        minify: true,
        platform: "browser",
        target: "es2020",
    }

    if (isDev) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
        contexts.push(ctx);
        console.log(`👀 Watching ${game.name}`);
    } else {
        await esbuild.build(config);
        console.log(`🚀 Built ${game.name}`);
    }
}
if (isDev) {
    const { hosts, port } = await contexts[0].serve({ servedir: "public", port: 8000, host: "0.0.0.0", });
    console.log(`🚀 Server running at http://${hosts.at(-1)}:${port}`);
}