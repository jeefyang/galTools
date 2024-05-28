import fs from "fs"
import path from 'path'

type Binaray2DataType = "string" | "uint" | "int" | "binary" | "origin" | "boolean"

type DecodeBinaryType<T extends { [x in string]: any }> = {
    name?: keyof T, size: number, type?: Binaray2DataType, isNull?: boolean

}

type PnaHeadType = {
    name: string
    emtpy1: number
    width: number
    height: number
    count: number
}

type PngHeadType = {
    emtpy1: number
    /** 当值为-1,则判定为非png */
    pngCheck: number
    deltaX: number
    deltaY: number
    width: number
    height: number
    /** 开关标记,0为不是,3为是 */
    tagOn: number
    /** 未解释标记,暂定为0 */
    tag2: number
    /** 固定标记, 1072693248|1071731025 */
    pngTag: number
    size: number
}

export type PngDataType = { head: PngHeadType, name: string, index: number, isOn: boolean, pair?: number, isTurn?: boolean }

export type PnaJsonType = {
    head: PnaHeadType, list: PngDataType[][], noUseList: PngDataType[]
}

export class PnaExtract {

    stream: fs.ReadStream | undefined
    baseName: string = ""
    pnaType: "guilty" = "guilty"

    constructor(public op: {
        inputFile: string

    }) {
        this.run()
    }

    readStream(cb: () => Promise<void>) {
        return new Promise((res) => {
            this.stream = fs.createReadStream(this.op.inputFile)


            let isRead = false
            this.stream.on("readable", async () => {
                if (isRead) {
                    return
                }
                isRead = true
                await cb()
                this.stream?.close()
            })

            this.stream.on("close", () => {
                console.log("close")
                this.stream = undefined

            })
        })

    }

    readBinary<T extends { [x in string]: any }>(l: DecodeBinaryType<T>[]): T {
        // @ts-ignore
        let d: T = {}
        if (!this.stream) {
            return d
        }

        for (let i = 0; i < l.length; i++) {
            let c = l[i]

            let buf: Buffer = this.stream.read(c.size)
            if (c.isNull) {
                continue
            }
            if (c.type == "int" || c.type == "uint") {
                // @ts-ignore
                let uint = 0
                let s = 0

                let hex = buf.toString('hex')
                for (let i = 0; i < hex.length; i += 2) {
                    let x = hex.substring(i, i + 2)
                    // if (x == "00") {
                    //     s += 8
                    //     continue
                    // }
                    uint += (1 << s) * parseInt(x, 16)
                    s += 8
                }
                // 判断是否为负数
                if (uint >>> 31) {
                    // 如果是负数，则通过二进制补码转换为负数
                    uint = (uint ^ 0xffffffff) + 1; // 取反再加1
                    uint = -uint; // 转换为负数
                }
                // @ts-ignore
                d[c.name] = uint
            }
            else if (c.type == "string") {
                // @ts-ignore
                d[c.name] = buf.toString()
            }
            else if (c.type == "binary") {
                // @ts-ignore
                d[c.name] = buf.toString("hex")
            }
            else if (c.type == "boolean") {
                // @ts-ignore
                d[c.name] = !!(parseInt(a, 16))
            }
            else if (c.type == "origin") {
                // @ts-ignore
                d[c.name] = buf
            }
        }

        return d
    }

    async decode(pngCB: (data: PngDataType) => Promise<void>): Promise<PnaJsonType> {
        let pnaHead = this.readBinary<PnaHeadType>([
            {
                name: "name", size: 4, type: "string"
            },
            {
                name: "emtpy1", size: 4, type: "uint"
            },
            {
                name: "width", size: 4, type: "uint"
            },
            {
                name: "height", size: 4, type: "uint"
            },
            {
                name: "count", size: 4, type: "uint"
            },
        ])

        let pngContentList: PngDataType[][] = []
        let pngContent: PngDataType[] = []
        let noUseList: PngDataType[] = []
        for (let i = 0; i < pnaHead.count; i++) {
            let pngHead = this.readBinary<PngHeadType>([
                { isNull: true, size: 4 },
                { name: "pngCheck", size: 4, type: "int" },
                { name: "deltaX", size: 4, type: "uint" },
                { name: "deltaY", size: 4, type: "int" },
                { name: "width", size: 4, type: "uint" },
                { name: "height", size: 4, type: "uint" },
                { name: "tagOn", size: 4, type: "uint" },
                { name: "tag2", size: 4, type: "int" },
                { name: "pngTag", size: 4, type: "int" },
                { name: "size", size: 4, type: "uint" },
            ])
            if (pngHead.pngCheck == -1) {
                noUseList.push({ head: pngHead, index: i, isOn: false, name: "" })
                pngContent.length && pngContentList.push(pngContent)
                pngContent = []
                continue
            }

            if (pngHead.pngTag != 1072693248 && pngHead.pngTag != 1071731025) {
                noUseList.push({ head: pngHead, index: i, isOn: false, name: "" })
                continue
            }
            let fileName = `${this.baseName}_${(1000 + i).toString().slice(1)}.png`
            let o: PngDataType = {
                head: pngHead,
                name: fileName,
                index: i,
                isOn: false
            }
            if (pngHead.tagOn == 3) {
                o.isOn = true
                // let oo: PngDataType = JSON.parse(JSON.stringify(o))
                // oo.isOn = false
                pngContent.length && pngContentList.push(pngContent)
                pngContentList.push([o])
                pngContent = []
                continue
            }
            pngContent.push(o)
        }
        pngContent.length && pngContentList.push(pngContent)

        let count = 0
        for (let i = 0; i < pngContentList.length; i++) {
            let list = pngContentList[i]
            for (let j = 0; j < list.length; j++) {
                count++
                let c = list[j]
                await pngCB(c)
            }
        }
        return { head: pnaHead, list: pngContentList, noUseList: noUseList }
    }

    private async _writeBuffer(fileName: string, size: number, limitSize: number) {
        return new Promise((res) => {
            let f = fs.createWriteStream(fileName, { autoClose: false })
            let s = size
            let loopFunc = () => {
                if (s <= 0) {
                    console.log('end')
                    f.end()
                    return
                }
                let v: Buffer = this.stream?.read(s > limitSize ? limitSize : s)

                // console.log(v.length)
                let check = f.write(v)
                s -= limitSize
                if (!check) {

                    return
                }
                loopFunc()

            }
            f.on("ready", () => {
                loopFunc()
            })
            f.on("finish", () => {
                console.log(`文件 ${fileName} 已经生成`)
                f.close()
                res(undefined)
            })
            // 塞满了
            f.on("drain", () => {
                loopFunc()
            })
            f.on("error", (e) => {
                f.close()
            })
        })

    }

    async extract(outDir: string): Promise<PnaJsonType> {
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true })
        }
        return new Promise(res => {
            this.readStream(async () => {
                let json = await this.decode(async (d) => {
                    let fileName = path.join(outDir, d.name)
                    await this._writeBuffer(fileName, d.head.size, 16)
                    return
                })
                let f = path.join(outDir, 'index.json')
                fs.writeFileSync(f, JSON.stringify(json))
                console.log(`配置文件 ${f} 已经生成!`)
                res(json)
                return
            })
        })

    }

    run() {
        this.baseName = path.parse(path.basename(this.op.inputFile)).name

    }
}
