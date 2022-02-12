const fs = require('fs');

fs.readFile('../../VERSION', (err, data) => {
    console.log(err);
    console.log(data);
})