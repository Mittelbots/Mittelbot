const guildAutomod = require('../../../src/db/Models/tables/guildAutomod.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const { Guilds } = require('./Guilds');

class Automod {
    constructor() {}

    add(guild_id) {
        return new Promise(async (resolve, reject) => {
            await guildAutomod
                .create(
                    {
                        guild_id,
                    },
                    {
                        ignoreDuplicates: true,
                    }
                )
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            const guild = await Guilds.get(guild_id);

            return resolve(guild.getAutomod());
        });
    }

    update({ guild_id, value, type }) {
        return new Promise(async (resolve, reject) => {
            await guildAutomod
                .update(
                    {
                        settings: value,
                    },
                    {
                        where: {
                            guild_id,
                        },
                    }
                )
                .then(() => {
                    return resolve(
                        `✅ Successfully updated automod settings for your guild to \`${type}\`.`
                    );
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(
                        `❌ Error updating automod settings for your guild to \`${type}\`.`
                    );
                });
        });
    }

    checkWhitelist({ setting, user_roles, role_id }) {
        let whitelist = setting.whitelistrole;
        if (!whitelist) return false;

        if (user_roles) {
            user_roles = user_roles.map((role) => role.id);
            whitelist = whitelist.roles.filter((r) => user_roles.includes(r));
            return whitelist.length > 0 ? true : false;
        }

        if (role_id) {
            return whitelist.roles.includes(role_id) ? true : false;
        }
    }
}

module.exports.Automod = new Automod();
