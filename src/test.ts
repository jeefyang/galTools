import { PnaExtract } from "./lib/pnaExtract.js"


// let bigUrl = "\\\\192.168.123.3\\藏经阁\\xunlei11\\hhd800.com@MIDV-207-C_X1080X.mp4"

let fileUrl = "D:\\Games\\gal\\extract\\Chip4\\ST08_L.pna"

let a = new PnaExtract({ inputFile: fileUrl })
let o = await a.extract("./testSave")