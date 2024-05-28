import { logColor } from "./lib/logColor.js"
import { MergeImg, type XTypeType, type YTypeType } from './lib/mergeImg.js'
import fs from 'fs'
import path from 'path'
import { PnaExtract, PnaJsonType, PngDataType } from "./lib/pnaExtract.js"

let exe_url = "magick"
let input_dir: string = ""
let out_dir: string = ""
let mergeDirName: string = "merge"
let extractDirName: string = "extract"
let m = new MergeImg()


function printHelp() {
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-h       帮助")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-e       magick程序,默认'magick'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-ind     输入的文件夹")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-outd      输出的文件夹")

}

function decodeArgv() {
    let c = 0
    let argv = process.argv
    while (argv[c]) {
        if (argv[c] == "-h" || argv[c] == "--help") {
            return false
        }
        else if (argv[c] == '-ind') {
            input_dir = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-outd') {
            out_dir = argv[c + 1]
            c += 2
            continue
        }
        c++
    }
    return true
}

async function run() {
    let check = decodeArgv()
    if (!check) {
        printHelp()
        return
    }

    m.exe_url = exe_url

    if (!input_dir || !fs.existsSync(input_dir)) {
        printHelp()
        return
    }

    if (!out_dir) {
        console.log("输出文件夹不能为空!")
        printHelp()
        return
    }

    let extractDir = path.join(out_dir, extractDirName)
    if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true })
    }
    let mergeDir = path.join(out_dir, mergeDirName)
    if (!fs.existsSync(mergeDir)) {
        fs.mkdirSync(mergeDir, { recursive: true })
    }

    let files = fs.readdirSync(input_dir)
    let arrList: { flist: PngDataType[], name: string }[] = []
    let split_num: number[] = []
    let loopFunc = (list: PnaJsonType['list'], curSplit: number[]) => {
        let a = curSplit.map((c, i) => { return list[i][c] })
        let last = a[a.length - 1]
        let name = path.parse(last.name).name
        arrList.push({ flist: a, name: name + `-` + curSplit.join('-') + '.png' })
        for (let i = 0; i < curSplit.length; i++) {
            if (curSplit[i] + 1 < split_num[i + 1]) {
                curSplit[i]++
                loopFunc(list, curSplit)
                return
            }
            curSplit[i] = 0
        }
    }
    for (let i = 0; i < files.length; i++) {
        let file = path.join(input_dir, files[i])
        if (path.extname(file).toLocaleLowerCase() != '.pna') {
            continue
        }
        let name = path.parse(file).name
        let p = new PnaExtract({ inputFile: file })
        let targetDir = path.join(extractDir, name)
        let json = await p.extract(targetDir)
        // let dataList = json.list
        // dataList = dataList.filter(c => c.findIndex(cc => cc.isOn) == -1)
        // arrList = []
        // split_num = dataList.map(c => c.length)
        // split_num.splice(0, 0, 0)
        // let split: number[] = dataList.map(c => 0)
        // console.log(JSON.parse(JSON.stringify(split)))
        // console.log(JSON.parse(JSON.stringify(split_num)))
        // loopFunc(dataList, split)
        // for (let i = 0; i < arrList.length; i++) {
        //     let c = arrList[i]
        //     let l = c.flist.filter(c => !c.isOn)
        //     let last = l[l.length - 1]
        //     let xdelta: number[] = l.map(c => c.head.deltaX - last.head.deltaX)
        //     let ydelta: number[] = l.map(c => c.head.deltaY - last.head.deltaY)
        //     m.merge({
        //         inputFiles: l.map(c => path.join(targetDir, c.name)),
        //         outFile: path.join(mergeDir, c.name),
        //         xtype: "left",
        //         ytype: "top",
        //         xdelta,
        //         ydelta
        //     })
        // }
    }
}

run()

