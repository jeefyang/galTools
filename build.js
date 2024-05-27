import { getBuildConfig } from "./buildFunc.js"
// @ts-ignore
import { build } from 'vite'

await getBuildConfig(false, true)

await build({

    mode: "fromJson",

})
