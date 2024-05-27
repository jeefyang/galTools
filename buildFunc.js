
import path from 'path'
import fs from "fs"
import readline from "readline"

const loadJsonUrl = "./buildConfig.jsonc"

/** 
 * @returns {Promise<string>}
 */
export async function rl_entrypath() {
    return new Promise((res) => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        let str = "请输入需要打包的入口文件:"
        rl.setPrompt(str)
        rl.prompt();
        rl.on("line", function (line) {
            if (!line) {
                rl.setPrompt(str)
                rl.prompt();
                return
            }
            if (!fs.existsSync(line)) {
                console.log("文件不存在!")
                rl.setPrompt(str)
                rl.prompt();
                return
            }
            rl.close()
            res(line)

        })
    })
}

/** 
 * @param {string} question
 * @param {string} [defaultVal]
 * @returns {Promise<string>}
 */
export async function rl_question(question, defaultVal) {
    return new Promise((res) => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        rl.setPrompt(question)
        rl.prompt();
        rl.write(defaultVal || "")
        rl.on("line", function (line) {
            if (!line) {
                rl.setPrompt(question)
                rl.prompt();
                rl.write(defaultVal || "")
                return
            }
            rl.close()
            res(line)

        })
    })
}

/** 
 * @param {boolean} [isNew] 是否重新创建
 * @param {boolean} [isSave] 注解
 */
export async function getBuildConfig(isNew, isSave) {
    console.log(isNew, isSave)
    /** @type {import('./typings/index').BuildConfigType} 注解 */
    let buildConfig = {}
    if (fs.existsSync(loadJsonUrl)) {
        try {
            buildConfig = eval(`(${fs.readFileSync(loadJsonUrl, 'utf-8')})`)
        }
        catch {
            console.log(`无法解析:${loadJsonUrl}`)
        }
    }
    else {
        console.log("创建打包配置文件")
        buildConfig.entryPath = ""
        buildConfig.fileName = ""
        buildConfig.libName = ""
        buildConfig.isDone = false
        fs.writeFileSync(loadJsonUrl, JSON.stringify(buildConfig), "utf-8")
    }

    if (isNew || !buildConfig.isDone) {
        buildConfig.entryPath = await rl_entrypath()
        let name = path.parse(path.basename(buildConfig.entryPath || "")).name
        buildConfig.libName = await rl_question("请输入库名:", name)
        buildConfig.fileName = await rl_question("请输入打包后的文件名:", name)
    }
    else {
        if (!fs.existsSync(buildConfig.entryPath || "")) {
            buildConfig.entryPath = await rl_entrypath()
        }
        let name = path.parse(path.basename(buildConfig.entryPath || "")).name
        if (!buildConfig.libName) {
            buildConfig.libName = await rl_question("请输入库名:", name)
        }
        if (!buildConfig.fileName) {
            buildConfig.fileName = await rl_question("请输入打包后的文件名:", name)
        }
    }

    buildConfig.isDone = true
    if (isSave) {
        fs.writeFileSync(loadJsonUrl, JSON.stringify(buildConfig), "utf-8")
    }
    return buildConfig
}




