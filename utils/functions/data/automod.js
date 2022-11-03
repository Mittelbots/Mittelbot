const guildAutomod = require('../../../src/db/Models/tables/guildAutomod.model');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.insertIntoGuildAutomod = async (guild_id) => {
    return new Promise(async (resolve, reject) => {
        await guildAutomod
            .create({
                guild_id,
            })
            .then(() => {
                resolve(true);
            })
            .catch((err) => {
                errorhandler({ err });
                return reject(false);
            });
    });
};

module.exports.getAutomodbyGuild = async (guild_id) => {
    return await guildAutomod
        .findOne({
            where: {
                guild_id,
            },
        })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            errorhandler({ err });
            return false;
        });
};

module.exports.updateAutoModbyGuild = async ({ guild_id, value, type }) => {
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
                return reject(`❌ Error updating automod settings for your guild to \`${type}\`.`);
            });
    });
};

module.exports.isOnWhitelist = ({ setting, user_roles }) => {
    let whitelist = JSON.parse(setting).whitelistrole;
    if (!whitelist) return false;

    user_roles = user_roles.map((role) => role.id);
    whitelist = whitelist.roles.filter((r) => user_roles.includes(r));

    return whitelist.length > 0 ? true : false;
};

module.exports.isRoleOnWhitelist = ({ setting, role_id }) => {
    const whitelist = JSON.parse(setting).whitelistrole;
    if (!whitelist) return false;

    return whitelist.roles.includes(role_id) ? true : false;
};
