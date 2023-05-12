const { isMod } = require('../isMod');

module.exports.checkTarget = async ({ author, guild, target, type }) => {
    return new Promise(async (resolve, reject) => {
        if (target.id === author.id) {
            return reject(
                global.t.trans(['error.moderation.youcantx.yourself', type], guild.id)
            );
        }
        if (type === 'mute' || type === 'warn') {
            if (target.bot || target.system) {
                return reject(
                    global.t.trans(['error.moderation.youcantx.bot', type], guild.id)
                );
            }
        }
        const isAMod = await isMod({
            member: await guild.members.fetch(target.id).catch(() => {}),
            guild,
        });
        if (isAMod) {
            return reject(global.t.trans(['error.moderation.youcantx.mod', type], guild.id));
        }
        return resolve(true);
    });
};
