import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/newkisan/',  // 👈 this is the fix
  plugins: [react()],
})
