import readline from 'readline'

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "test"
})

rl.setPrompt('Test> ');
let str='ffsdf'
rl.write(str)

rl.prompt();


rl.on('line', function(line) {
    console.log("输出",line)
    // switch(line.trim()) {
    //     case 'copy':
    //         console.log("复制");
    //         break;
    //     case 'hello':
    //         console.log('world!');
    //         break;
    //     case 'close':
    //         rl.close();
    //         break;
    //     default:
    //         console.log('没有找到命令！');
    //         break;
    // }
    // rl.prompt();
});

rl.on('close', function() {
    console.log('bye bye!');
    process.exit(0);
});
