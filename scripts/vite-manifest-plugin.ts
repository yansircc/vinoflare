import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export function manifestPlugin(): Plugin {
  return {
    name: 'vite-manifest-plugin',
    apply: 'build',
    closeBundle() {
      try {
        // 读取 manifest 文件
        const manifestPath = path.join(process.cwd(), 'dist/client/.vite/manifest.json')
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
        
        // 提取客户端入口的资源路径
        const clientEntry = manifest['src/client.tsx']
        const assets = {
          js: clientEntry?.file ? `/${clientEntry.file}` : '/static/client.js',
          css: clientEntry?.css?.[0] ? `/${clientEntry.css[0]}` : '/assets/client.css'
        }
        
        // 生成资源映射文件
        const assetsPath = path.join(process.cwd(), 'src/assets-manifest.json')
        fs.writeFileSync(assetsPath, JSON.stringify(assets, null, 2))
        
        console.log('Assets manifest generated:', assets)
      } catch (err) {
        console.error('Failed to generate assets manifest:', err)
      }
    }
  }
} 