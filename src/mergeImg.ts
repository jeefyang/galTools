import path from "path"
import child_process from "child_process"
import process from "process"
import fs from 'fs'

let exe_url = "magick"
let input_dirs: string[] = []
let output_dir: string = ""
let input_files: string[] = []
let output_file: string = ""
let split_input_dir: string = ""
let split_num: number[] = []
type XTypeType = "left" | "center" | "right"
const xtypeList: XTypeType[] = ["left", "center", "right"]
let xtype: XTypeType = "center"
type YTypeType = 'top' | "bottom" | "center"
const ytypeList: YTypeType[] = ['top', "bottom", "center"]
let ytype: YTypeType = "center"
let xdelta: number[] = [0]
let ydelta: number[] = [0]
let xRadioDeleta: number[] = []
let yRadioDeleta: number[] = []

const logColor = {
    /** 透明背景 */
    'opacityBG': '\x1B[0m', // 透明背景
    /** 亮色 */
    'bright': '\x1B[1m', // 亮色
    /** 灰色 */
    'grey': '\x1B[2m', // 灰色
    /** 斜体 */
    'italic': '\x1B[3m', // 斜体
    /** 下划线 */
    'underline': '\x1B[4m', // 下划线
    /** 反向 */
    'reverse': '\x1B[7m', // 反向
    /** 隐藏 */
    'hidden': '\x1B[8m', // 隐藏
    /** 黑色 */
    'black': '\x1B[30m', // 黑色
    /** 红色 */
    'red': '\x1B[31m', // 红色
    /** 绿色 */
    'green': '\x1B[32m', // 绿色
    /** 黄色 */
    'yellow': '\x1B[33m', // 黄色
    /** 蓝色 */
    'blue': '\x1B[34m', // 蓝色
    /** 品红 */
    'magenta': '\x1B[35m', // 品红
    /** 青色 */
    'cyan': '\x1B[36m', // 青色
    /** 白色 */
    'white': '\x1B[37m', // 白色
    /** 亮黑色 */
    'brightblack': '\x1B[90m', // 亮黑色
    /** 亮红色 */
    'brightred': '\x1B[91m', // 亮红色
    /** 亮绿色 */
    'brightgreen': '\x1B[92m', // 亮绿色
    /** 亮黄色 */
    'brightyellow': '\x1B[93m', // 亮黄色
    /** 亮蓝色 */
    'brightblue': '\x1B[94m', // 亮蓝色
    /** 亮品红 */
    'brightmagenta': '\x1B[95m', // 亮品红
    /** 亮青色 */
    'brightcyan': '\x1B[96m', // 亮青色
    /** 亮白色 */
    'brightwhite': '\x1B[97m', // 亮白色
    /** 背景色为黑色 */
    'blackBG': '\x1B[40m', // 背景色为黑色
    /** 背景色为红色 */
    'redBG': '\x1B[41m', // 背景色为红色
    /** 背景色为绿色 */
    'greenBG': '\x1B[42m', // 背景色为绿色
    /** 背景色为黄色 */
    'yellowBG': '\x1B[43m', // 背景色为黄色
    /** 背景色为蓝色 */
    'blueBG': '\x1B[44m', // 背景色为蓝色
    /** 背景色为品红 */
    'magentaBG': '\x1B[45m', // 背景色为品红
    /** 背景色为青色 */
    'cyanBG': '\x1B[46m', // 背景色为青色
    /** 背景色为白色 */
    'whiteBG': '\x1B[47m' // 背景色为白色
}

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
            xtype = xtypeList[xtypeList.findIndex(a => argv[c + 1] == a)] || 'center'
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
            ytype = ytypeList[ytypeList.findIndex(a => argv[c + 1] == a)] || 'center'
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

const cache_sizeList: { [propName: string]: number[] } = {}
function getSize(file: string) {
    if (cache_sizeList[file]) {
        return cache_sizeList[file]
    }
    let cmd = `"${exe_url}" identify -format "%[fx:w]x%[fx:h]" "${file}"`
    let s = child_process.execSync(cmd, { encoding: "utf-8" })
    let arr: number[] = s.split("x").map(c => Number(c) || 0)
    cache_sizeList[file] = arr
    return arr
}

function mergeImg(inputFiles: string[], outFile: string) {
    let outDir = path.dirname(outFile)
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
    }
    let sizeList: { w: number, h: number }[] = []
    for (let i = 0; i < inputFiles.length; i++) {
        let file = inputFiles[i]
        let size = getSize(file)
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
    let cmd = `"${exe_url}" convert -size ${maxW}x${maxH} xc:none`
    let c = ""
    for (let i = 0; i < inputFiles.length; i++) {
        let file = inputFiles[i]
        let size = sizeList[i]
        let x = 0
        let y = 0
        if (xtype == "left") {
            x += (xdelta[i] || 0)
        }
        else if (xtype == "center") {
            x = (maxW - size.w) / 2 + (xdelta[i] || 0)
        }
        else if (xtype == "right") {
            x = (maxW - size.w) - (xdelta[i] || 0)
        }
        if (ytype == "top") {
            y += (ydelta[i] || 0)
        }
        else if (ytype == "center") {
            y = (maxH - size.h) / 2 + (ydelta[i] || 0)
        }
        else if (ytype == "bottom") {
            y = (maxH - size.h) - (ydelta[i] || 0)
        }
        x += (xRadioDeleta[i] || 0) * size.w
        y += (yRadioDeleta[i] || 0) * size.h
        c = ` -draw "image over ${x},${y} 0,0 '${file}'"` + c
    }
    cmd += c
    cmd += ` "${outFile}"`
    console.log(cmd)
    let s = child_process.execSync(cmd)
    console.log(`合成成功,输出:${output_file}`)

}

function run() {
    let check = decodeArgv()
    if (!check) {
        printHelp()
        return
    }

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
        mergeImg(input_files, output_file)
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
            mergeImg(input_files, output_file)
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
                mergeImg(arrList[i].flist, path.join(output_dir, arrList[i].name))
            }
        }

    }
    else {
        printHelp()
        return
    }

}

run()