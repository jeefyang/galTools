import path from "path"
import { MergeImg, type XTypeType, type YTypeType } from './lib/mergeImg'
import process from "process"
import fs from 'fs'
import { logColor } from "./lib/logColor"

let exe_url = "magick"
let input_dirs: string[] = []
let output_dir: string = ""
let input_files: string[] = []
let output_file: string = ""
let split_input_dir: string = ""
let split_num: number[] = []

let xtype: XTypeType = "center"

let ytype: YTypeType = "center"
let xdelta: number[] = [0]
let ydelta: number[] = [0]
let xRadioDeleta: number[] = []
let yRadioDeleta: number[] = []
let m = new MergeImg()


function printHelp() {
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-h       帮助")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-e       magick程序,默认'magick'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-ids     输入的文件夹集合,用;区分,只会遍历第一层,与-od搭配,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-od      输出的文件夹,与-ids搭配,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-ifs     输入的文件列表,用;区分,与-of,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-of      输出的文件,用;区分,与-ifs,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-xt      x坐标偏移逻辑,'center','left','right',默认'center'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-xd      x坐标偏移量,可多个,用;区分,默认'0'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-xrd     x坐标额外尺寸比例偏移量,可多个,用;区分,默认'0'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-yt      y坐标偏移逻辑,'center','top','bottom',默认'center'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-yd      y坐标偏移量,可多个,用;区分,默认'0;'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-yrd     y坐标额外尺寸比例偏移量,,可多个,用;区分,默认'0;'")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-spid    切割文件夹模式的输入文件夹,与-sp,-od联动,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-sp      切割文件夹模式的切割数量,可以多个,用;区分,与-spid,-od联动,可选")
    console.log(`${logColor.brightgreen}%s${logColor.opacityBG}`, "请按照以上内容输入正确的命令")
}

function decodeArgv() {
    let c = 0
    let argv = process.argv
    while (argv[c]) {
        if (argv[c] == "-h" || argv[c] == "--help") {
            return false
        }
        else if (argv[c] == '-ids') {
            input_dirs = argv[c + 1].split(';')
            c += 2
            continue
        }
        else if (argv[c] == '-od') {
            output_dir = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-ifs') {
            input_files = argv[c + 1].split(';')
            c += 2
            continue
        }
        else if (argv[c] == '-of') {
            output_file = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-xt') {
            xtype = m.xtypeList[m.xtypeList.findIndex(a => argv[c + 1] == a)] || 'center'
            c += 2
            continue
        }
        else if (argv[c] == '-xd') {
            xdelta = argv[c + 1].split(";").map(c => Number(c) || 0)
            c += 2
            continue
        }
        else if (argv[c] == '-xrd') {
            xRadioDeleta = argv[c + 1].split(";").map(c => Number(c) || 0)
            c += 2
            continue
        }
        else if (argv[c] == '-yt') {
            ytype = m.ytypeList[m.ytypeList.findIndex(a => argv[c + 1] == a)] || 'center'
            c += 2
            continue
        }
        else if (argv[c] == '-yd') {
            ydelta = argv[c + 1].split(";").map(c => Number(c) || 0)
            c += 2
            continue
        }
        else if (argv[c] == '-yrd') {
            yRadioDeleta = argv[c + 1].split(";").map(c => Number(c) || 0)
            c += 2
            continue
        }
        else if (argv[c] == '-spid') {
            split_input_dir = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-sp') {
            split_num = argv[c + 1].split(";").map(c => Number(c) || 0)
            c += 2
            continue
        }
        c++
    }
    return true
}

function run() {
    let check = decodeArgv()
    if (!check) {
        printHelp()
        return
    }

    m.exe_url = exe_url

    if (input_dirs.length > 0 && output_dir) {
        if (!fs.existsSync(output_dir)) {
            fs.mkdirSync(output_dir, { recursive: true })
        }

    }
    else if (input_files.length > 0 && output_file) {
        let outputDir = path.dirname(output_file)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(output_dir, { recursive: true })
        }
        m.merge({
            inputFiles: input_files,
            outFile: output_file,
            xtype: xtype,
            ytype,
            xRadioDeleta,
            yRadioDeleta,
            xdelta,
            ydelta

        })
    }
    else if (split_input_dir && output_dir) {
        if (!fs.existsSync(split_input_dir)) {
            printHelp()
            return
        }
        if (!fs.existsSync(output_dir)) {
            fs.mkdirSync(output_dir, { recursive: true })
        }
        let flist = fs.readdirSync(split_input_dir)
        if (split_num.length == 0) {
            m.merge({
                inputFiles: input_files,
                outFile: output_file,
                xtype: xtype,
                ytype,
                xRadioDeleta,
                yRadioDeleta,
                xdelta,
                ydelta

            })
        }
        else {
            let arrList: { flist: string[], name: string }[] = []
            let split: number[] = split_num.map(c => c)
            split_num.splice(0, 0, 0)
            split_num.push(flist.length)
            split.splice(0, 0, 0)
            let loopFunc = (curSplit: number[]) => {
                let a = curSplit.map(c => { return path.join(split_input_dir, flist[c]) })
                let lastP = a[a.length - 1]
                let name = path.parse(lastP).name
                arrList.push({ flist: a, name: name + `-` + curSplit.join('-') + '.png' })
                for (let i = 0; i < curSplit.length; i++) {
                    if (curSplit[i] + 1 < split_num[i + 1]) {
                        curSplit[i]++
                        loopFunc(curSplit)
                        return
                    }
                    curSplit[i] = split_num[i]
                }
            }
            loopFunc(split)
            for (let i = 0; i < arrList.length; i++) {
                m.merge({
                    inputFiles: arrList[i].flist,
                    outFile: path.join(output_dir, arrList[i].name),
                    xtype: xtype,
                    ytype,
                    xRadioDeleta,
                    yRadioDeleta,
                    xdelta,
                    ydelta
                })
            }
        }

    }
    else {
        printHelp()
        return
    }

}

run()