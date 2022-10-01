const database = require('../src/db/db');
const tables = require('../src/db/table.json');
const readline = require('readline');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');


async function checkDatabase() {

    var table_count = 0;
    var col_count = 0;
    var del_col_count = 0;
    var insert_count = 0;

    //?CREATE ALL NONDYNAMICAL TABLES LIKE advancedScamList, etc
    for (let t in tables) {
        await database.query(`CREATE TABLE ${t} (id INT AUTO_INCREMENT PRIMARY KEY)`)
            .then(() => table_count++)
            .catch(err => {
                if(err.code === "ER_TABLE_EXISTS_ERROR") return;
                errorhandler({err, fatal: false});
            });

        for (let c in tables[t]) {
            if(tables[t][c].name == undefined) continue;
            await database.query(`ALTER TABLE ${t} ADD COLUMN ${tables[t][c].name} ${tables[t][c].val} ${(tables[t][c].default) ? 'DEFAULT '+ JSON.stringify(tables[t][c].default) : ''} `)
                .then(() => col_count++)
                .catch(err => {
                    if(err.code === "ER_DUP_FIELDNAME") return
                    errorhandler({err, fatal: false});
                });

            // if (tables[t][c].insert) {

            //     await database.query(`INSERT IGNORE INTO ${t} (${tables[t][c].name}) VALUES (${JSON.stringify(tables[t][c].insert)})`)
            //         .then(async () => {
            //             insert_count++;
            //         })
            //         .catch(err => {
            //            errorhandler({err, fatal: false});
            //         });
            // }
        }
    }
    console.info(`Main function passed! ${table_count} Tables and ${col_count} Columns created, ${del_col_count} Columns deleted and ${insert_count} values inserted!`)
}


if (process.argv[1].includes('/_scripts/checkDatabase.js')) {
    const read_line_interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    read_line_interface.question('Do you want to create Templates? [Default: No]\n', function (status) {
        if (status.toLowerCase() === 'yes' || status.toLowerCase() === 'y') {
            createTemplates();
        } else {
            checkDatabase();
        }
        read_line_interface.close();
    });
}


module.exports = {
    checkDatabase
}