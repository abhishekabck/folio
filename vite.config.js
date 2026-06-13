import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// v4 (tenbinlabs-style dark crystal background). Distinct ports; never collides with v1/v2/v3.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5204, strictPort: true },
  preview: { port: 5214, strictPort: true },
})
