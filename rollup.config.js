import * as path from "path";
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { terser } from "rollup-plugin-terser";

const config = {
  treeshake: {
    moduleSideEffects: 'no-external',
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  input: {
    index: path.resolve(__dirname, 'src/main/start.js'),
    cli: path.resolve(__dirname, 'src/main/cli.js'),
  },
  external: [
    ...Object.keys(require('./package.json').dependencies),
  ],
  output: {
    dir: path.resolve(__dirname, 'dist/'),
    entryFileNames: `[name].js`,
    chunkFileNames: 'chunks/dep-[hash].js',
    exports: 'named',
    format: 'cjs',
    externalLiveBindings: false,
    freeze: false,
  },
  plugins: [
    nodeResolve({
      preferBuiltins: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: "node_modules/**",
    }),
    commonjs({
      extensions: ['.js'],
      ignoreDynamicRequires: true,
    }),
    json(),
    terser(),
  ],
};

export default config;
