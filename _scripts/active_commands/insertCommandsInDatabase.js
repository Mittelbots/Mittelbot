const database = require("../../src/db/db");
const cmd_config = require('../../src/assets/json/command_config/command_help.json');

async function main() {
    await database.query('SELECT * FROM all_guild_id').then(async guild_id_db => {
        guild_id_db = await guild_id_db;

        let commands = [];

        for(let i in cmd_config) {
            if(cmd_config[i].name) {
                commands.push(cmd_config[i].name);
            }else {
                for(let x in cmd_config[i]) {
                    commands.push(cmd_config[i][x].name);
                }
            }
        }

        commands = commands.filter(Boolean);
        let guilds = [];

        await database.query('SELECT guild_id FROM active_commands').then(async res => {
            
            guilds = guild_id_db.filter(gid => !res.map(r => r.guild_id).includes(gid.guild_id));

        }).catch(err => {
            console.error(err);
            process.exit();
        });

        if(guilds.length == 0) process.exit();

        for(let i in guilds) {
            await database.query('INSERT INTO active_commands (active_commands, disabled_commands, guild_id, global_disabled) VALUES (?, ?, ?, ?)', [JSON.stringify(commands), "[]", guilds[i].guild_id, "[]"])
                .then(() => {console.info(`Added ${guilds[i].guild_id} to active_commands`)})
                .then(err => {
                    if(err) console.error(err);
                })
        }

        process.exit();
    });
}


main();