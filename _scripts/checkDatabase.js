const database = require('../src/db/db');
const tables = require('../src/db/table.json');
const readline = require('readline');



async function main() {
    
    var table_count = 0;
    var col_count = 0;
    var del_col_count = 0;

    //?CREATE ALL NONDYNAMICAL TABLES LIKE advancedScamList, etc
    for(let t in tables.nondynamical) {
        await database.query(`CREATE TABLE ${t} (id INT AUTO_INCREMENT PRIMARY KEY)`)
            .then(() => table_count++)
            .catch(err => {
                //console.log(err)
            });

        for(let c in tables.nondynamical[t]) {
            await database.query(`ALTER TABLE ${t} ADD COLUMN ${tables.nondynamical[t][c].name} ${tables.nondynamical[t][c].val}`)
                .then(() => col_count++)
                .catch(err => {
                    //console.log(err)
                });
        }
    }

    //?GET ALL GUILDIDS FROM DATABASE
    var guildids = await database.query(`SELECT * FROM all_guild_id`).then(async res => {
        return await res;
    }).catch(err => {
        //console.log(err)
    });

    
    //?CREATE ALL DYNAMICAL TABLES LIKE _config
    for(let g in guildids) {
        for(let t in tables.dynamical) {
            await database.query(`CREATE TABLE ${guildids[g].guild_id}${t} (id INT AUTO_INCREMENT PRIMARY KEY)`)
                .then(() => table_count++)
                .catch(err => {
                    //console.log(err)
                });

            for(let c in tables.dynamical[t]) {
                if(c === "_DELETE") {
                    for(let delete_column in tables.dynamical[t][c]) {
                        await database.query(`ALTER TABLE ${guildids[g].guild_id}${t} DROP COLUMN ${tables.dynamical[t][c][delete_column]}`)
                            .then(() => del_col_count++)
                            .catch(err => {
                                //console.log(err);
                            })
                        continue;
                    }
                }
                await database.query(`ALTER TABLE ${guildids[g].guild_id}${t} ADD COLUMN ${tables.dynamical[t][c].name} ${tables.dynamical[t][c].val} ${(tables.dynamical[t][c].default) ? 'DEFAULT '+ JSON.stringify(tables.dynamical[t][c].default) : ''} `)
                    .then(() => col_count++)
                    .catch(err => {
                        //console.log(err)  
                    });
            }
        }
    }

    console.log(`Main function passed! ${table_count} Tables and ${col_count} Columns created and ${del_col_count} Columns deleted!`)
    process.exit();
}

async function createTemplates() {

    var table_count = 0;
    var col_count = 0;

    for(let t in tables.dynamical) {
        await database.query(`CREATE TABLE ${t}_template (id INT AUTO_INCREMENT PRIMARY KEY)`)
            .then(()=> {table_count++})
            .catch(err => {
                //console.log(err)
            });

            for(let c in tables.dynamical[t]) {
                if(c === "_DELETE") {
                    for(let delete_column in tables.dynamical[t][c]) {
                        await database.query(`ALTER TABLE ${t}_template DROP COLUMN ${tables.dynamical[t][c][delete_column]}`)
                            .then(() => del_col_count++)
                            .catch(err => {
                                //console.log(err);
                            })
                    }
                    continue;
                }
                await database.query(`ALTER TABLE ${t}_template ADD COLUMN ${tables.dynamical[t][c].name} ${tables.dynamical[t][c].val}`)
                    .then(() => {col_count++})
                    .catch(err => {
                        //console.log(err)
                    });
            }
    }

    console.log(`createTemplate function passed! ${table_count} Tables and ${col_count} Columns created!`)
    process.exit();
}

    const read_line_interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    read_line_interface.question('Do you want to create Templates? [Default: No]\n', function(status) {

        if(status.toLowerCase() === 'yes' || status.toLowerCase() === 'y') {
            createTemplates(); 
        }
        else {
            main();
        }

        read_line_interface.close();
    });