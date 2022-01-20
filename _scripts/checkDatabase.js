const {Database} = require('../src/db/db');
const tables = require('../src/db/table.json');
const readline = require('readline');

const database = new Database();


async function main() {
    var guildids = await database.query(`SELECT * FROM all_guild_id`).then(async res => {
        return await res;
    }).catch(err => {
        console.log(err)
    });
    for(let i in await guildids) {
        for(let x in tables.tables) {
            database.query(`CREATE TABLE ${guildids[i].guild_id}${tables.tables[x]} LIKE ${tables.tables[x]}_template`).catch(err => {
                if(err.code === 'ER_TABLE_EXISTS_ERROR') return;
                console.log(err);
            });
        }

        for(let c in tables) {
            for(let col in tables[c]) {
                if(c === 'tables') continue;
                database.query(`ALTER TABLE ${guildids[i].guild_id}${c} ADD COLUMN ${tables[c][col].name} ${tables[c][col].val}`).catch(err => {
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
        await database.query(`CREATE TABLE ${tables.tables[x]}_template (id INT AUTO_INCREMENT PRIMARY KEY)`).then(res => {return true}).catch(err => {
            if(err.code === 'ER_TABLE_EXISTS_ERROR') return;
            console.log(err);
        });
    }
    for(let c in tables) {
        for(let col in tables[c]) {
            if(c === 'tables') continue;
            await database.query(`ALTER TABLE ${c}_template ADD COLUMN ${tables[c][col].name} ${tables[c][col].val}`).catch(err => {
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