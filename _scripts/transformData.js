const database = require('../src/db/db');
const all_guild_id = require('../utils/functions/data/all_guild_id');
const old_DB_name = '_guild_level';

const isGuildIdRequired = true;

async function main() {
    var all_guilds = [];
    if (isGuildIdRequired) {
        all_guilds = await all_guild_id.getAll();

        if (!all_guilds) {
            console.error('No guilds found or an error occured', err);
        }
    }

    for (let i in all_guilds) {
        await database
            .query(`INSERT IGNORE INTO guild_config (guild_id) VALUES (?)`, [
                all_guilds[i].guild_id,
            ])
            .then((res) => {
                if (res.affectedRows > 0) {
                    console.log('GUILD INSERTED');
                }
            })
            .catch((err) => {
                console.log(err);
            });
        var data = await database
            .query(`SELECT * FROM ${isGuildIdRequired ? all_guilds[i].guild_id : ''}${old_DB_name}`)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                console.error('Error occured', err);
            });

        if (!data) continue;

        if (old_DB_name === '_guild_joinroles') {
            var array = [];
            for (let i in data) {
                array.push(data[i].role_id);
            }

            await database
                .query(`UPDATE guild_config SET joinroles = ? WHERE guild_id = ?`, [
                    JSON.stringify(array),
                    all_guilds[i].guild_id,
                ])
                .then((res) => {
                    console.log('Success!');
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        if (old_DB_name === '_guild_level') {
            for (let d in data) {
                await database
                    .query(
                        `INSERT INTO guild_level (guild_id, xp, user_id, level_announce, message_count) VALUES (?, ?, ?, ?, ?)`,
                        [
                            all_guilds[i].guild_id,
                            data[d].xp,
                            data[d].user_id,
                            data[d].level_announce,
                            data[d].message_count,
                        ]
                    )
                    .then((res) => {
                        console.log('Success!');
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    }
}

main();
