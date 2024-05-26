import { defineConfig } from 'vite'
import path from 'node:path'
import readline from "readline"
import fs from 'fs'


// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {




  return {
    build: {
      lib: {
        entry: path.resolve(__dirname,"./src/garbroExtract.ts"),
        name: 'garbroExtract',
        fileName: 'garbroExtract'
      },
      rollupOptions: {

      }
    }
  }

})