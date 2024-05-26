import path from "path"
import child_process from "child_process"
import process from "process"
import fs from 'fs'
import { logColor } from "./logColor"

let exe_dir = ""
let input_dir = ""
let out_dir = ""
let no_ex: string = ""
let fileList: string[] = []
let exList: string[] = []
let rmExList: string[] = []
let exe_name = "GARbro.Console.exe"




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