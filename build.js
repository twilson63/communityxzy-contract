const { build } = require('esbuild');
const glob = require('glob');
const fs = require('fs');

glob('./src/**/*.ts', (err, res) => {
  build({
    entryPoints: res,
    outdir: './dist',
    minify: false,
    bundle: false
  }).catch(() => process.exit(1));
});

