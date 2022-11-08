const guildBlacklist = require('../../src/assets/json/blacklist/guilds.json');

module.exports.isGuildBlacklist = ({guild_id}) => {
    const isBlacklist = guildBlacklist.find(g => g === guild_id);

    if(isBlacklist) return true;
    else return false;
}