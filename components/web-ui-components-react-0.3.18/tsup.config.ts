import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  // Ensure the React runtime is NOT bundled inside this library;
  // it must be provided by the consuming app to avoid multiple React copies.
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@auth0/auth0-react'
  ],
});
