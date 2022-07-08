const levelAPI = require("./levelsystemAPI")

module.exports.run = async (message, bot) => {
    var currentxp = await levelAPI.gainXP(message);
    if(!currentxp) return;

    var newxp = await levelAPI.generateXP(currentxp);

    var updateXP = await levelAPI.updateXP(message, newxp)
    if(!updateXP) return;

    var checkXP = await levelAPI.checkXP(bot, message.guild.id, newxp, message);
    if(!checkXP) return;
    
    await levelAPI.sendNewLevelMessage(checkXP[0], message.author, newxp, checkXP[1])

    currentxp, newxp, updateXP, checkXP = null
}