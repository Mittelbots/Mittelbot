const fs = require('fs');

fs.readFile('./VERSION', 'utf-8', (err, data) => {
    if(err) throw err;

    data = parseFloat(data);
    console.log(data);
})