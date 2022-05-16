const config = require('../../src/assets/json/_config/config.json');
async function getEmote(bot, id) {
    return await bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).emojis.cache.get(id);
}

module.exports = {getEmote}