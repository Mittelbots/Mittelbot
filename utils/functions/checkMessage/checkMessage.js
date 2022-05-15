const { isMod } = require("../isMod");

async function checkMessage({author, guild, target, bot, type}) {
    if (target.id === author.id) return `You can't ${type} yourself.`;
    if (target.id === bot.user.id) return `You cant't ${type} me.`;
    if (target.bot || target.system) return `You can't ${type} a bot!`;
    if (await isMod({member: guild.members.cache.get(target.id), guild})) return `You can't ${type} a mod!`;
}

module.exports = {checkMessage}