const config = require('../src/assets/json/_config/config.json');
const {
    Database
} = require("../src/db/db");
const {
    giveAllRoles
} = require("../utils/functions/roles/giveAllRoles");
const {
    errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const { log } = require('../logs');

async function guildMemberAdd(member, bot) {
    const database = new Database();
    database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
        if (await res.length == 0) {
            database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, user_joined) VALUES (?, ?)`, [member.user.id, new Date()]).catch(err => {
                return log.fatal(err);
            });
        } else {
            if (res[0].user_joined == null) {
                database.query(`UPDATE ${member.guild.id}_guild_member_info SET user_joined = ? WHERE user_id = ?`, [new Date(), member.user.id]).catch(err => {
                    return errorhandler(err, config.errormessages.databasequeryerror, null, log, config)
                });
            }
            await database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND guild_id = ? AND mute = ?`, [member.user.id, member.guild.id, 1]).then(async inf => {
                if (await inf.length != 0) {
                    member.roles.add([member.guild.roles.cache.find(r => r.name === 'Muted')]);
                } else {
                    let user_roles = await res[0].member_roles;
                    user_roles = JSON.parse(user_roles);

                    //? IF MUTED ROLE IS IN USERS DATASET -> MUTED ROLE WILL BE REMOVED
                    if (user_roles !== null && user_roles.indexOf(member.roles.cache.find(r => r.name === 'Muted')) !== -1) user_roles = user_roles.filter(val => {
                        return val !== member.roles.cache.find(r => r.name === 'Muted').id
                    });

                    giveAllRoles(member, member.guild, user_roles, bot);
                }
            }).catch(err => {
                return log.fatal(err)
            });
        }
        return database.close();
    }).catch(err => {
        return log.fatal(err)
    });

    database.query(`SELECT welcome_channel FROM ${member.guild.id}_config`).then(res => {
        if (res[0].welcome_channel !== null) {
            bot.channels.cache.find(c => c.id === res[0].welcome_channel).send('Welcome ' + member.user.username)
        }
    }).catch(err => {
        if (config.debug == 'true') console.log(err)
        return log.fatal(err);
    })

    database.query(`SELECT * FROM ${member.guild.id}_guild_joinroles`).then(res => {
        for (i in res) {
            let role = member.guild.roles.cache.find(r => r.id === res[i].role_id);
            //setTimeout(function () {
            try {
                member.roles.add(role);
            } catch (err) {
                //NO PERMISSONS
                return database.close();
            }
            // }, 10000);
        }

    }).catch(err => {
        if (config.debug == 'true') console.log(err)
        return log.fatal(err);
    });
}

module.exports = {
    guildMemberAdd
}