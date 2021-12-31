const config = require('../../config.json');
async function getEmote(bot, id) {
    return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).emojis.cache.get(id);
}

module.exports = {getEmote}