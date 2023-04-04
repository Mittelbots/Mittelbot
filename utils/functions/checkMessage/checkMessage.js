const { isMod } = require('../isMod');

module.exports.checkTarget = async ({ author, guild, target, type }) => {
    return new Promise(async (resolve, reject) => {
        if (target.id === author.id) return reject(`You can't ${type} yourself.`);
        if (type === 'mute' || type === 'warn') {
            if (target.bot || target.system) return reject(`You can't ${type} a bot!`);
        }
        const isAMod = await isMod({
            member: await guild.members.fetch(target.id).catch((err) => {}),
            guild,
        });
        if (isAMod) return reject(`You can't ${type} a mod!`);
        return resolve(true);
    });
};
