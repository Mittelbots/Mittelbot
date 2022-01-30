const {Database} = require('../src/db/db');
const tables = require('../src/db/table.json');
const readline = require('readline');
const config = require('../config.json');

const database = new Database();


async function main() {

    for(let t in tables.nondynamical) {
        await database.query(`CREATE TABLE ${t} (id INT AUTO_INCREMENT PRIMARY KEY)`).catch(err => {console.log(err)})
        for(let c in tables.nondynamical[t]) {
            await database.query(`ALTER TABLE ${t} ADD COLUMN ${tables.nondynamical[t][c].name} ${tables.nondynamical[t][c].val}`).catch(err => console.log(err))
        }
    }

    return;

    var guildids = await database.query(`SELECT * FROM all_guild_id`).then(async res => {
        return await res;
    }).catch(err => {
        console.log(err)
    });
    for(let i in await guildids) {
        for(let x in tables.tables) {
            await database.query(`CREATE TABLE ${guildids[i].guild_id}${tables.tables[x]} LIKE ${tables.tables[x]}_template`).then(async () => {
                
                console.log(`**${guildids[i].guild_id}${tables.tables[x]} CREATED**`)

                if(tables.tables[x] == tables.tables[0]) {
                    await database.query(`INSERT INTO ${guildids[i].guild_id}${tables.tables[x]} (guild_id, prefix) VALUES (?, ?)`, [guildids[i].guild_id, config.defaultprefix]).catch(err => console.log(err))
                }else if(tables.tables[x] == tables.tables[2]) {
                    await database.query(`INSERT INTO ${guildids[i].guild_id}${tables.tables[x]} (id) VALUES (?)`, [1]).catch(err => console.log(err));
                }
            }).catch(err => {
                if(err.code === 'ER_TABLE_EXISTS_ERROR') return;
                console.log(err);
            });
            
        }

        for(let c in tables) {
            for(let col in tables[c]) {
                if(c === 'tables') continue;
                database.query(`ALTER TABLE ${guildids[i].guild_id}${c} ADD COLUMN ${tables[c][col].name} ${tables[c][col].val}`).then(() => console.log(`**COLUMN ${tables[c][col].name} ADDED TO ${guildids[i].guild_id}${c}**`)).catch(err => {
                    if(err.code === 'ER_DUP_FIELDNAME') return;
                    console.log(err);
                });
            }
        }
    }
    console.log('main function passed!')
}

async function createTemplates() {
    for(let x in tables.tables) {
        await database.query(`CREATE TABLE ${tables.tables[x]}_template (id INT AUTO_INCREMENT PRIMARY KEY)`).then(() => {console.log(`**TEMPLATE ${tables.tables[x]}_template CREATED`); return true}).catch(err => {
            if(err.code === 'ER_TABLE_EXISTS_ERROR') return;
            console.log(err);
        });
    }
    for(let c in tables) {
        for(let col in tables[c]) {
            if(c === 'tables') continue;
            await database.query(`ALTER TABLE ${c}_template ADD COLUMN ${tables[c][col].name} ${tables[c][col].val}`).then(() => console.log(`**TEMPLATE COLUMN ${tables[c][col].name} ADDED TO ${c}_template**`)).catch(err => {
                if(err.code === 'ER_DUP_FIELDNAME') return;
                console.log(err);
            });
        }
    }

    console.log('createTemplate function passed!')
}

    const read_line_interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    read_line_interface.question('Do you want to create Templates?', function(status) {
        if(status.toLowerCase() === 'yes') {createTemplates(); setTimeout(() => main(), 4000) }
        else main();

        read_line_interface.close();
    });