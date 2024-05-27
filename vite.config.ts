import { defineConfig } from 'vite'
import path from 'node:path'
import readline from "readline"
import fs from 'fs'
import { getBuildConfig } from './buildCmd.js'
import { type BuildConfigType } from "./typings/index.d"



// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
  let buildConfig: BuildConfigType = await getBuildConfig(mode != "fromJson", false)

  return {
    build: {
      // 关闭chunk的hash值，即关闭timestamp
      chunkSize: 0,
      // 关闭asset的hash值，即关闭timestamp
      assetHosting: false,
      // 关闭sourcemap的timestamp
      sourcemap: false,
      lib: {
        entry: path.resolve(__dirname, buildConfig.entryPath || ""),
        name: buildConfig.libName || "",
        fileName: buildConfig.fileName || ""
      },
      rollupOptions: {

      }
    }
  }

})