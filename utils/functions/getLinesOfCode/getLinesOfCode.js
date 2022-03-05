var fs = require('fs');
const {
    exec
} = require('child_process')

async function getLinesOfCode(cb) {

    function readOutput(stdout) {
        var index = stdout.search('Source');
        var lines = '';

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

            const folder = ['_logs', '_.github', 'node_modules', '.bashrc', '.gitattributes', '.gitignore', 'LICENSE', 'package-lock.json', 'package.json', 'README.md', 'VERSION', '.git', '.github'];

            var currentFolder = '';
            var codeLines = 0;

            for (let i in entity) {
                if (folder.includes(entity[i])) continue;

                exec(`sloc ./${entity[i]}`, (err, stdout, stderr) => {
                    codeLines = codeLines + Number(readOutput(stdout))
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