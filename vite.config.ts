import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
        tailwindcss()
      ],
      build: {
        outDir: 'dist/client',
        emptyOutDir: false,
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            entryFileNames: 'static/client.js',
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
