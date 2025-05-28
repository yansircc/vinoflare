import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

export default defineConfig({
  plugins: [
    // TanStack Router plugin must be first
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    cloudflare(), 
    ssrPlugin(),
    tailwindcss()
  ]
})
