const levelAPI = require("./levelsystemAPI")

module.exports.run = async (message, bot) => {
    if (message.author.bot || message.author.system) return {
        error: "bot"
    };

    const isBlacklistChannel = await levelAPI.checkBlacklistChannels({
        message
    });
    if(isBlacklistChannel) return {
        error: "blacklist",
    }

    var currentxp = await levelAPI.gainXP({
        guild_id: message.guild.id,
        user_id: message.author.id
    });
    if(!currentxp) return{
        error: "noxp"
    };

    var newxp = await levelAPI.generateXP(currentxp);

    var updateXP = await levelAPI.updateXP({
        guild_id: message.guild.id,
        user_id: message.author.id,
        newxp
    })
    if(!updateXP) return {
        error: "updatexp"
    }

    var checkXP = await levelAPI.checkXP(bot, message.guild.id, newxp, message);
    if(!checkXP) return {
        error: "checkxp"
    }
    
    await levelAPI.sendNewLevelMessage(checkXP[0], message, newxp, checkXP[1])

    currentxp, newxp, updateXP, checkXP = null;

    return {
        error: "none"
    }
}