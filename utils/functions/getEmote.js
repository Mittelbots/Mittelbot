function getEmote(bot, id) {
    return bot.guilds.cache.get(process.env.DEVELOPER_DISCORD_GUILD_ID).emojis.cache.get(id);
}

module.exports = { getEmote };
