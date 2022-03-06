var fs = require('fs');
const {
    exec
} = require('child_process')

async function getLinesOfCode(cb) {

    async function readOutput(stdout) {
        var index = stdout.search('Source');
        var lines = '';

        if(index === -1) return;

        while (isNaN(stdout[index]) || stdout[index] == ' ') {
            index++;
            if (!isNaN(stdout[index]) && stdout[index] !== ' ') {
                return readLines(index);
            }
        }

        function readLines(index) {
            while (!isNaN(stdout[index]) && stdout[index] !== ' ') {
                lines += stdout[index];
                index++;
            }
            lines = lines.replace("\n", '');

            return lines;
        }
    }

    function readCode() {
        fs.readdir('./', "utf8", function (err, entity) {

            if(err) console.log(err)

            const folder = ['_logs', '_.github', 'node_modules', '.bashrc', '.gitattributes', '.gitignore', 'LICENSE', 'package-lock.json', 'package.json', 'README.md', '.git', '.github'];

            var codeLines = 0;

            for (let i in entity) {
                if (folder.includes(entity[i])) continue;

                exec(`sloc ./${entity[i]}`, async (err, stdout, stderr) => {
                    var output = await readOutput(stdout)
                    if(output === undefined || output === null) return;

                    codeLines = Number(codeLines) + Number(output)
                });
            }
            setTimeout(() => {
                return cb(codeLines)
            }, 10000);
            
        });
    }
    readCode();
}
module.exports = {
    getLinesOfCode
};