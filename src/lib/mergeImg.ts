import fs from 'fs'
import path from "path"
import { execSync } from 'child_process'

export type XTypeType = "left" | "center" | "right"
export type YTypeType = 'top' | "bottom" | "center"

export class MergeImg {

    exe_url = "magick"
    readonly xtypeList: XTypeType[] = ["left", "center", "right"]
    readonly ytypeList: YTypeType[] = ['top', "bottom", "center"]

    cache_sizeList: { [propName: string]: number[] } = {}

    getSize(file: string,) {

        if (this.cache_sizeList[file]) {
            return this.cache_sizeList[file]
        }
        let cmd = `"${this.exe_url}" identify -format "%[fx:w]x%[fx:h]" "${file}"`
        let s = execSync(cmd, { encoding: "utf-8" })
        let arr: number[] = s.split("x").map(c => Number(c) || 0)
        this.cache_sizeList[file] = arr
        return arr
    }

    merge(o: { inputFiles: string[], outFile: string, xtype: XTypeType, ytype: YTypeType, xdelta?: number[], ydelta?: number[], xRadioDeleta?: number[], yRadioDeleta?: number[] }) {
        let outDir = path.dirname(o.outFile)
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true })
        }
        let sizeList: { w: number, h: number }[] = []
        for (let i = 0; i < o.inputFiles.length; i++) {
            let file = o.inputFiles[i]
            let size = this.getSize(file)
            sizeList.push({ w: size[0], h: size[1] })
        }
        let maxW = 0
        let maxH = 0
        sizeList.forEach(c => {
            if (maxW < c.w) {
                maxW = c.w
            }
            if (maxH < c.h) {
                maxH = c.h
            }
        })
        let cmd = `"${this.exe_url}" convert -size ${maxW}x${maxH} xc:none`
        let c = ""
        for (let i = 0; i < o.inputFiles.length; i++) {
            let file = o.inputFiles[i]
            let size = sizeList[i]
            let x = 0
            let y = 0
            if ((o.xtype) == "left") {
                x += (o.xdelta?.[i] || 0)
            }
            else if (o.xtype == "center") {
                x = (maxW - size.w) / 2 + (o.xdelta?.[i] || 0)
            }
            else if (o.xtype == "right") {
                x = (maxW - size.w) - (o.xdelta?.[i] || 0)
            }
            if (o.ytype == "top") {
                y += (o.ydelta?.[i] || 0)
            }
            else if (o.ytype == "center") {
                y = (maxH - size.h) / 2 + (o.ydelta?.[i] || 0)
            }
            else if (o.ytype == "bottom") {
                y = (maxH - size.h) - (o.ydelta?.[i] || 0)
            }
            x += (o.xRadioDeleta?.[i] || 0) * size.w
            y += (o.yRadioDeleta?.[i] || 0) * size.h
            c = ` -draw "image over ${x},${y} 0,0 '${file}'"` + c
        }
        cmd += c
        cmd += ` "${o.outFile}"`
        console.log(cmd)
        let s = execSync(cmd)
        console.log(`合成成功,输出:${o.outFile}`)

    }

}


