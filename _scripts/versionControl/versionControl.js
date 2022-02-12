const fs = require('fs');

fs.readFile('./VERSION', 'utf-8', (err, data) => {
    if(err) throw err;

    data = data.split(".")
    
    // 0.1 0=STABLE; 1=BETA

    let stable = data[0];

    let beta = data[1]

    if(process.argv[2] == 'beta') beta++;
    else if('stable') stable++
    else return;
    
    fs.writeFileSync('./VERSION', stable + '.' + beta);
});