const fs = require('fs');

fs.readFile('./VERSION', 'utf-8', (err, data) => {
    if(err) throw err;

    console.log(JSON.stringify(data))
    data = parseFloat(data);
    console.log(data);
})