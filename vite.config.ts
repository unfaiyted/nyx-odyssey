import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  server: {
    port: 3003,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      external: ['child_process', 'util', 'fs', 'path', 'postgres', 'perf_hooks', 'net', 'tls', 'crypto', 'stream', 'os']
    }
  },
  optimizeDeps: {
    exclude: ['postgres']
  },
  ssr: {
    noExternal: [],
    external: ['postgres']
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset: 'bun',
      devServer: {
        port: 42071,
      },
      externals: {
        inline: [],
        external: ['postgres'],
      },
    }),
    viteReact(),
  ],
})

export default config
