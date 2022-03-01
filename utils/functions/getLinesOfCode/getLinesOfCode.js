const {exec} = require('child_process');

async function getLinesOfCode(cb) {
    exec('git ls-files | xargs wc -l', (err, stdout, stderr) => {
        try {
            if(err) {
                if(err.killed) {
                    console.log(err);
                }
            }
            let array = stdout.split(' ');
            let i = stdout.length;
            while(i > 0) {
                if(!isNaN(array[i])) {
                    return cb(array[i]);
                }else {
                    i--;
                }
            }
        }catch(err) {
            console.log(err)
        }
    });
}
module.exports = {getLinesOfCode};