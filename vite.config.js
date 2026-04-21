import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  base: "/2526-iagen/",
  plugins: [
    // tailwindcss(),
    react(), tsconfigPaths()
  ],
})
