const database = require('../src/db/db');
const tables = require('../src/db/table.json');
const {log} = require('../logs');

;

let res = database.query(`SELECT * FROM all_guild_id`).then(async res => {
    return await res;
}).catch(err => {
    throw err;
});


res.then((res) => {
    for (let g in res) {
        for(let t in tables.tables) {
            database.query(`SELECT id FROM ${res[g].guild_id}${tables.tables[t]}`).catch(err => {
                database.query(`CREATE TABLE ${res[g].guild_id}${tables.tables[t]} LIKE ${tables.tables[t]}_template`).catch(err => {log.fatal(err)});
                console.log(`${res[g].guild_id}${tables.tables[t]} added!`);
            });
        }
        console.log(`${Number(g) + 1} of ${res.length} done`);
    }
});