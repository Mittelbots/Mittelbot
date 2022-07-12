const levelAPI = require("./levelsystemAPI")

module.exports.run = async (message, bot) => {
    if (message.author.bot || message.author.system) return;

    var currentxp = await levelAPI.gainXP({
        guild_id: message.guild.id,
        user_id: message.author.id
    });
    if(!currentxp) return;

    var newxp = await levelAPI.generateXP(currentxp);

    var updateXP = await levelAPI.updateXP({
        guild_id: message.guild.id,
        user_id: message.author.id,
        newxp
    })
    if(!updateXP) return;

    var checkXP = await levelAPI.checkXP(bot, message.guild.id, newxp, message);
    if(!checkXP) return;
    
    await levelAPI.sendNewLevelMessage(checkXP[0], message, newxp, checkXP[1])

    currentxp, newxp, updateXP, checkXP = null
}