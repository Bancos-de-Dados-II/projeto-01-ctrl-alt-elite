import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/projeto-01-ctrl-alt-elite/', // 👈 Use exatamente o nome do seu repositório no GitHub entre barras
})