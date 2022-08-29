const database = require("../src/db/db");
const {
    getAllGuildIds
} = require("../utils/functions/data/getAllGuildIds");

const old_DB_name = "_guild_joinroles";
const new_DB_name = "guild_config";
const isGuildIdRequired = true;

async function main() {
    var all_guilds = [];
    if (isGuildIdRequired) {
        all_guilds = await getAllGuildIds();

        if (!all_guilds) {
            console.error("No guilds found or an error occured", err);
        }
    }

    for (let i in all_guilds) {

        await database.query(`INSERT IGNORE INTO guild_config (guild_id) VALUES (?)`, [all_guilds[i].guild_id])
            .then(res => {
                if (res.affectedRows > 0) {
                    console.log('GUILD INSERTED')
                }
            }).catch(err => {
                console.log(err)
            })

        var data = await database.query(`SELECT * FROM ${isGuildIdRequired ? all_guilds[i].guild_id : ""}${old_DB_name}`)
            .then(res => {
                return res;
            })
            .catch(err => {
                console.error("Error occured", err);
            });

        if (!data) continue;

        var array = [];
        for(let i in data) {
            array.push(data[i].role_id) 
        }

        await database.query(`UPDATE guild_config SET joinroles = ? WHERE guild_id = ?`, [JSON.stringify(array), all_guilds[i].guild_id])
            .then(res => {
                console.log('Success!')
            }).catch(err => {
                console.log(err)
            })
    }
}


main();