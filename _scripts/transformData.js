const database = require("../src/db/db");
const {
    getAllGuildIds
} = require("../utils/functions/data/getAllGuildIds");

const old_DB_name = "_config";
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

        if (old_DB_name == "_guild_modroles") {
            let mod_roles = [];
            for (let d in data) {
                const obj = {
                    role: data[d].role_id,
                    isadmin: data[d].isadmin,
                    ismod: data[d].ismod,
                    ishelper: data[d].ishelper
                }
                mod_roles.push(obj);
            }

            await database.query(`UPDATE ${new_DB_name} SET modroles = ? WHERE guild_id = ? `, [JSON.stringify(mod_roles), all_guilds[i].guild_id])
                .then(() => {
                    console.log(`Successfully inserted new data.`);
                })
                .catch(err => {
                    console.error("Error occured", err);
                });
        }

        if (old_DB_name == "_config") {
            data = data[0];

            var levelsettings = {
                "mode": "normal",
                "levelup_channel": "disable"
            }

            levelsettings = JSON.stringify(levelsettings)

            var logs = await database.query(`SELECT * FROM ${all_guilds[i].guild_id}_guild_logs`)
                .then(res => {
                    return res;
                })
                .catch(err => {
                    console.error("Error occured", err);
                });

            var logsettings = {};

            if (logs.length > 0) {
                (logs[0].modlog) ? logsettings.modlog = logs[0].modlog: '';
                (logs[0].auditlog) ? logsettings.auditlog = logs[0].auditlog: '';
                (logs[0].messagelog) ? logsettings.messagelog = logs[0].messagelog: '';
            }

            var warnroles = await database.query(`SELECT * FROM ${all_guilds[i].guild_id}_guild_warnroles`)
                .then(res => {
                    return res;
                })
                .catch(err => {
                    console.error("Error occured", err);
                });

            var roles = []
            for (let i in warnroles) {
                roles.push(warnroles[i].role_id);
            }

            roles = JSON.stringify(roles);

            await database.query(`UPDATE ${new_DB_name} SET prefix = ?, cooldown = ?, deleteModCommandAfterUsage = ?, deleteCommandAfterUsage = ? , disabled_modules = ?, warnroles = ?, logs = ?, levelsettings = ?`, [data.prefix, data.cooldown || 0, data.deleteModCommandAfterUsage || 0, data.deleteCommandAfterUsage || 0, JSON.stringify(data.disabled_modules), roles, JSON.stringify(logsettings), levelsettings])
                .then(() => {
                    console.log(JSON.stringify(logsettings), all_guilds[i].guild_id)
                    console.log(`Successfully inserted new data.`);
                })
                .catch(err => {
                    console.error("Error occured", err);
                });
        }
    }
}


main();