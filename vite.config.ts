import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  server: {
    allowedHosts: [
      'localhost',
      'impose-settling-outtakes.ngrok-free.dev'   // Cho phép ngrok
    ],
    port: 5173,
    strictPort: true,
  }
})