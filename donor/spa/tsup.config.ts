import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.jsx'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
  bundle: true,
  //external: ['react', 'react-dom', '@auth0/auth0-react'],
  noExternal: ['react', 'react-dom', 'react-router-dom', '@auth0/auth0-react', '@auth0/web-ui-components-react', 'react/jsx-runtime'],
  outDir: 'public/dist'
});
