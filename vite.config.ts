import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // SSR/prerender build: when VITE_BUILD_TARGET=server, produce the server bundle.
  // Normal client build is unchanged (the default).
  ...(mode === 'ssr'
    ? {
        build: {
          ssr: true,
          outDir: 'dist-server',
          rollupOptions: {
            input: 'src/entry-server.tsx',
            output: {
              // CommonJS so Node can require() it without ESM flags
              format: 'cjs',
              entryFileNames: 'entry-server.cjs',
            },
          },
        },
      }
    : {}),
}))
