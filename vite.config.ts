import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'
import { manifestPlugin } from './scripts/vite-manifest-plugin'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
        tailwindcss(),
        manifestPlugin()
      ],
      build: {
        outDir: 'dist/client',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            entryFileNames: 'static/[name]-[hash].js',
            chunkFileNames: 'chunks/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'assets/[name]-[hash].css'
              }
              return 'assets/[name]-[hash][extname]'
            },
          },
        },
      },
    }
  } else {
    return {
      plugins: [
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
        cloudflare(), 
        ssrPlugin(),
        tailwindcss()
      ]
    }
  }
})
