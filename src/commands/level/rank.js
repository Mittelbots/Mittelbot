const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const levelAPI = require('../../../utils/functions/levelsystem/levelsystemAPI');
const card = require('rank-card-generator');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async (bot, message, args) => {
    let mention = args[0];

    if(mention) {
        try {
            mention = removeMention(mention);
            var member = await message.guild.members.fetch(mention)
            mention = member.id;
        }catch(err) {
            return message.reply('I can\t find this user!').catch(err => {});
        }
    }else {
        mention = message.author.id
    }

    const playerXP = await levelAPI.getXP(message.guild.id, mention);
    if (!playerXP) {
        return message.reply('Not possible! You have to gain xp first.').catch(err => {});
    }

    const levelSettings = await levelAPI.getLevelSettingsFromGuild(message.guild.id);
    if(!levelSettings) {
        return message.reply({
            files: [await card.rankCard(null, null, playerXP.level_announce || 'N/A', playerXP.xp, 0, 0, 0 , bot.users.cache.find(m => m.id === mention))]
        }).catch(err => {});
    }else {
        const nextLevel = await levelAPI.getNextLevel(levelSettings, playerXP.level_announce);
        return message.reply({
            files: [await card.rankCard(null, null, playerXP.level_announce, playerXP.xp, nextLevel.needXP, 0, 0 , bot.users.cache.find(m => m.id === mention))]
        }).catch(err => {});
    }
}

module.exports.help = cmd_help.levelsystem.rank