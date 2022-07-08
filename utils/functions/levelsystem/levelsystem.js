const levelAPI = require("./levelsystemAPI")

module.exports.run = async (message, bot) => {
    const currentxp = await levelAPI.gainXP(message);
    if(!currentxp) return;

    const newxp = await levelAPI.generateXP(currentxp);

    const updateXP = await levelAPI.updateXP(message, newxp)
    if(!updateXP) return;

    const checkXP = await levelAPI.checkXP(bot, message.guild.id, newxp, message);
    if(!checkXP) return;
    
    await levelAPI.sendNewLevelMessage(checkXP[0], message.author, newxp, checkXP[1])
}