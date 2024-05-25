import path from "path"
import child_process from "child_process"
import process from "process"
import fs from 'fs'

let exe_dir = ""
let input_dir = ""
let out_dir = ""
let no_ex: string = ""
let fileList: string[] = []
let exList: string[] = []
let rmExList: string[] = []
let exe_name = "GARbro.Console.exe"

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


function run() {

    let check = decodeArgv()
    if (!check) {
        printHelp()
        return
    }

    if (!exe_dir || !fs.existsSync(exe_dir)) {
        console.log(`${logColor.brightred}%s${logColor.opacityBG}`, `文件夹:${exe_dir} 不是有效的程序文件夹`)
        printHelp()
        return
    }
    if (!fs.existsSync(path.join(exe_dir, exe_name))) {
        console.log(`${logColor.brightred}%s${logColor.opacityBG}`, `文件夹:${exe_dir} 找不到有效程序:${exe_name}`)
        printHelp()
        return
    }
    if (!out_dir) {
        console.log(`${logColor.brightred}%s${logColor.opacityBG}`, `输出文件夹为空,请输入指定输出文件夹`)
        printHelp()
        return
    }
    if (!fs.existsSync(out_dir)) {
        console.log("创建文件夹:", out_dir)
        fs.mkdirSync(out_dir, { recursive: true })

    }
    if (input_dir) {
        if (!fs.existsSync(input_dir)) {
            console.log(`${logColor.brightred}%s${logColor.opacityBG}`, `输入文件夹:${input_dir} 不存在`)
            printHelp()
            return
        }
        if (!fs.statSync(input_dir).isDirectory()) {
            console.log(`${logColor.brightred}%s${logColor.opacityBG}`, `输入文件夹:${input_dir} 不是文件夹`)
            printHelp()
            return
        }
        let flist = fs.readdirSync(exe_dir)
        for (let i = 0; i < flist.length; i++) {
            let f = flist[i]
            let p = path.join(input_dir, f)
            if (!fs.statSync(p).isFile()) {
                continue
            }
            fileList.push(p)
        }
    }
    console.log(fileList, exList)
    for (let i = 0; i < fileList.length; i++) {
        extractData(fileList[i], path.join(out_dir, path.parse(fileList[i]).name), exList.length == 0)
    }
    console.log("打完收工")
}

function extractData(file: string, outDir: string, isAll: boolean) {
    if (!fs.existsSync(outDir)) {
        console.log(`创建文件夹:${outDir}`)
        fs.mkdirSync(outDir, { recursive: true })
    }
    let isExtract = isAll || exList.includes(path.extname(file).slice(1).toLocaleLowerCase())
    if (!isExtract) {
        console.log(`${file},后缀名不存在于[${exList}]`)
        return
    }
    let cmd = `${exe_dir}/${exe_name} -x ${file}`
    console.log(`执行命令:${cmd}`)
    let str = child_process.execSync(cmd, { encoding: "utf-8" })
    console.log(str)
    console.log(`提取:${file} 已经完成!`)
    let nameList = str.split('\n').map(c => c.split(' ')[1])
    for (let i = 0; i < nameList.length; i++) {
        let name = nameList[i]
        if (!name) {
            continue
        }
        let ex = path.extname(name).slice(1).toLocaleLowerCase()
        if (!ex) {
            fs.renameSync(path.join('./', name), path.join(outDir, name + '.' + no_ex))
            continue
        }
        if (rmExList.includes(ex)) {
            console.log(`发现:${name} 后缀名符合删除后缀名,应该删除`)
            fs.rmSync(path.join('./', name))
            continue
        }
        if (exList.includes(ex)) {
            console.log(`发现:${name} 后缀名符合提取后缀名,开始提取`)
            extractData(path.join('./', name), path.join(outDir, path.parse(name).name), false)
            console.log(`${name} 提取后,触发删除`)
            fs.rmSync(path.join('./', name))
            continue
        }
        let from = path.join('./', name)
        let to = path.join(outDir, name)
        fs.renameSync(from, to)
        console.log(`移动文件:${from} ---> ${to}`)
    }
}

function printHelp() {
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-h       帮助")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-ed      gabro所在文件夹(由于提取文件会放在此文件夹)")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-id      输入的文件夹,只会遍历第一层,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-od      输出的文件夹")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-ifs     输入的文件列表,用;区分,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-exs     额外识别的文件格式,用;区分,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-noex    没有后缀名,则自动添加后缀,可选")
    console.log(`${logColor.brightcyan}%s${logColor.opacityBG}`, "-rmexs   额外删除多余的文件格式,用;区分,可选")
    console.log(`${logColor.brightgreen}%s${logColor.opacityBG}`, "请按照以上内容输入正确的命令")
}

function decodeArgv() {
    let c = 0
    let argv = process.argv
    while (argv[c]) {
        if (argv[c] == "-h" || argv[c] == "--help") {
            return false
        }
        else if (argv[c] == '-ed') {
            exe_dir = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-id') {
            input_dir = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-noex') {
            no_ex = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-od') {
            out_dir = argv[c + 1]
            c += 2
            continue
        }
        else if (argv[c] == '-ifs') {
            fileList = argv[c + 1].split(';')
            c += 2
            continue
        }
        else if (argv[c] == '-rmexs') {
            rmExList = argv[c + 1].split(';')
            c += 2
            continue
        }
        else if (argv[c] == '-exs') {
            exList = argv[c + 1].split(';')
            c += 2
            continue
        }
        c++
    }
    return true
}

run()