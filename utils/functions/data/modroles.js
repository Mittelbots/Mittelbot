const { getGuildConfig, updateGuildConfig } = require('./getConfig');

module.exports.updatePermsFromModroles = async ({
    guild_id,
    role_id,
    isadmin,
    ismod,
    ishelper,
}) => {
    return new Promise(async (resolve, reject) => {
        const config = await getGuildConfig({
            guild_id,
        });
        var modroles;
        try {
            modroles = JSON.parse(config.settings.modroles);
        } catch (e) {
            modroles = config.settings.modroles;
        }

        try {
            modroles = JSON.parse(modroles);
        } catch (e) {}

        if (!modroles) modroles = [];

        const obj = {
            role: role_id,
            isadmin: isadmin,
            ismod: ismod,
            ishelper: ishelper,
        };

        const index = modroles.findIndex((x) => x.role === role_id);

        if (index !== -1) {
            modroles[index] = obj;
        }

        modroles.push(obj);

        return await updateGuildConfig({
            guild_id,
            value: JSON.stringify(modroles),
            valueName: 'modroles',
        })
            .then(async (res) => {
                resolve(
                    `✅ ${role_id} has been updated to ${
                        isadmin ? 'Admin' : ismod ? 'Moderator' : 'Helper'
                    }.`
                );
            })
            .catch((err) => {
                reject(`❌ There was an error updating the reaction roles.`);
            });
    });
};
