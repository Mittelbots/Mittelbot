const database = require('../src/db/db');
const tables = require('../src/db/table.json');
const readline = require('readline');
const {
    startUpCache
} = require('../utils/functions/cache/startUpCache');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');


async function checkDatabase() {

    var table_count = 0;
    var col_count = 0;
    var del_col_count = 0;
    var insert_count = 0;

    
    //?GET ALL GUILDIDS FROM DATABASE
    var guildids = await database.query(`SELECT * FROM all_guild_id`).then(async res => {
        return await res;
    }).catch(err => {
        errorhandler({err, fatal: true});
    });

    //?CREATE ALL NONDYNAMICAL TABLES LIKE advancedScamList, etc
    for (let t in tables.nondynamical) {
        await database.query(`CREATE TABLE ${t} (id INT AUTO_INCREMENT PRIMARY KEY)`)
            .then(() => table_count++)
            .catch(err => {
                if(err.code === "ER_TABLE_EXISTS_ERROR") return;
                errorhandler({err, fatal: false});
            });

        for (let c in tables.nondynamical[t]) {
            await database.query(`ALTER TABLE ${t} ADD COLUMN ${tables.nondynamical[t][c].name} ${tables.nondynamical[t][c].val}`)
                .then(() => col_count++)
                .catch(err => {
                    if(err.code === "ER_DUP_FIELDNAME") return
                    errorhandler({err, fatal: false});
                });

            // if (tables.nondynamical[t][c].insert) {

            //     await database.query(`INSERT IGNORE INTO ${t} (${tables.nondynamical[t][c].name}) VALUES (${JSON.stringify(tables.nondynamical[t][c].insert)})`)
            //         .then(async () => {
            //             insert_count++;
            //         })
            //         .catch(err => {
            //            errorhandler({err, fatal: false});
            //         });
            // }
        }
    }


    //?CREATE ALL DYNAMICAL TABLES LIKE _config
    for (let g in guildids) {
        for (let t in tables.dynamical) {
            await database.query(`CREATE TABLE ${guildids[g].guild_id}${t} (id INT AUTO_INCREMENT PRIMARY KEY)`)
                .then(() => table_count++)
                .catch(err => {
                    if(err.code === "ER_TABLE_EXISTS_ERROR") return;
                    errorhandler({err, fatal: false});
                });

            for (let c in tables.dynamical[t]) {
                if (c === "_DELETE") {
                    for (let delete_column in tables.dynamical[t][c]) {
                        await database.query(`ALTER TABLE ${guildids[g].guild_id}${t} DROP COLUMN ${tables.dynamical[t][c][delete_column]}`)
                            .then(() => del_col_count++)
                            .catch(err => {
                                if(err.code === "ER_DUP_FIELDNAME") return
                                errorhandler({err, fatal: false});
                            })
                        continue;
                    }
                }
                await database.query(`ALTER TABLE ${guildids[g].guild_id}${t} ADD COLUMN ${tables.dynamical[t][c].name} ${tables.dynamical[t][c].val} ${(tables.dynamical[t][c].default) ? 'DEFAULT '+ JSON.stringify(tables.dynamical[t][c].default) : ''} `)
                    .then(async () => {
                        col_count++;
                    })
                    .catch(err => {
                        if(err.code === "ER_DUP_FIELDNAME") return
                        errorhandler({err, fatal: false});
                    });
            }
        }

        //? INSERT INTO guild_config
        await database.query(`INSERT IGNORE INTO guild_config (guild_id) VALUES (${guildids[g].guild_id})`)
            .then(async () => {
                insert_count++;
            })
            .catch(err => {
                if(err.code === "ER_DUP_ENTRY") return;
                errorhandler({err, fatal: false});
            });
    }

    

    console.info(`Main function passed! ${table_count} Tables and ${col_count} Columns created, ${del_col_count} Columns deleted and ${insert_count} values inserted!`)
}

async function createTemplates() {

    var table_count = 0;
    var col_count = 0;

    for (let t in tables.dynamical) {
        await database.query(`CREATE TABLE ${t}_template (id INT AUTO_INCREMENT PRIMARY KEY)`)
            .then(() => {
                table_count++
            })
            .catch(err => {
                if(err.code === "ER_TABLE_EXISTS_ERROR") return;
                errorhandler({err, fatal: false});
            });

        for (let c in tables.dynamical[t]) {
            if (c === "_DELETE") {
                for (let delete_column in tables.dynamical[t][c]) {
                    await database.query(`ALTER TABLE ${t}_template DROP COLUMN ${tables.dynamical[t][c][delete_column]}`)
                        .then(() => del_col_count++)
                        .catch(err => {
                            if(err.code === "ER_DUP_FIELDNAME") return
                            errorhandler({err, fatal: false});
                        })
                }
                continue;
            }
            await database.query(`ALTER TABLE ${t}_template ADD COLUMN ${tables.dynamical[t][c].name} ${tables.dynamical[t][c].val}`)
                .then(() => {
                    col_count++
                })
                .catch(err => {
                    if(err.code === "ER_DUP_FIELDNAME") return
                    errorhandler({err, fatal: false});
                });
        }
    }

    await startUpCache();
    console.info(`createTemplate function passed! ${table_count} Tables and ${col_count} Columns created!`)
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