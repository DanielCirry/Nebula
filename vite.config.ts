import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devApiPlugin } from './vite-api-plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
  server: {
    port: 4200,
    watch: { ignored: ['**/dev-portfolio.json'] },
  },
})
