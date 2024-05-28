import { logColor } from "./lib/logColor.js"
import { MergeImg, type XTypeType, type YTypeType } from './lib/mergeImg.js'
import fs from 'fs'
import path from 'path'
import { PnaExtract, PnaJsonType, PngDataType } from "./lib/pnaExtract.js"

let exe_url = "magick"
let input_dirs: string[] = []
let out_dir: string = ""
let mergeDirName: string = "merge"
let extractDirName: string = "extract"
let m = new MergeImg()
let jsonName = "index.json"

function printHelp() {
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-h       帮助")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-e       magick程序,默认'magick'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-inds     输入的文件夹列表")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-outd      输出的文件夹")

}

function decodeArgv() {
    let c = 0
    let argv = process.argv
    while (argv[c]) {
        if (argv[c] == "-h" || argv[c] == "--help") {
            return false
        }
        else if (argv[c] == '-inds') {
            input_dirs = argv[c + 1].split(';')
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

async function decode(input_dir: string) {
    if (!input_dir || !fs.existsSync(input_dir)) {
        printHelp()
        return
    }

    if (!out_dir) {
        console.log("输出文件夹不能为空!")
        printHelp()
        return
    }

    let json: PnaJsonType = JSON.parse(fs.readFileSync(path.join(input_dir, jsonName), "utf-8"))
    let dataList = json.list
    for (let i = 0; i < dataList.length; i++) {
        let l = dataList[i]
        for (let j = l.length - 1; j >= 0; j--) {
            if (l[j].isTurn) {
                let c: PngDataType = JSON.parse(JSON.stringify(l[j]))
                c.isTurn = false
                l.push(c)
            }
        }
    }
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


    dataList = dataList.filter(c => c.findIndex(cc => cc.isOn) == -1)
    arrList = []
    split_num = dataList.map(c => c.length)
    split_num.splice(0, 0, 0)
    let split: number[] = dataList.map(c => 0)
    console.log(JSON.parse(JSON.stringify(split)))
    console.log(JSON.parse(JSON.stringify(split_num)))
    loopFunc(dataList, split)
    for (let i = 0; i < arrList.length; i++) {
        let c = arrList[i]
        let l = c.flist.filter(c => !c.isOn && !c.isTurn)
        if(l[0].pair){
            l=l.filter(c=>c.pair==l[0].pair)
            if(l.length<=1){
                continue
            }
        }
        let last = l[l.length - 1]
        let xdelta: number[] = l.map(c => c.head.deltaX - last.head.deltaX)
        let ydelta: number[] = l.map(c => c.head.deltaY - last.head.deltaY)
        m.merge({
            inputFiles: l.map(c => path.join(input_dir, c.name)),
            outFile: path.join(out_dir, c.name),
            xtype: "left",
            ytype: "top",
            xdelta,
            ydelta
        })
    }
    return

}

async function run() {
    let check = decodeArgv()
    if (!check) {
        printHelp()
        return
    }

    m.exe_url = exe_url

    for (let i = 0; i < input_dirs.length; i++) {
        decode(input_dirs[i])
    }


    console.log("打完收工")
}

run()