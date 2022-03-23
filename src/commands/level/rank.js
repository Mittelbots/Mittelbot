const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const levelAPI = require('../../../utils/functions/levelsystem/levelsystemAPI');
const card = require('rank-card-generator');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const canvacord = require("canvacord");
const { MessageAttachment } = require('discord.js');

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

    const user = bot.users.cache.find(m => m.id === mention);

    const playerXP = await levelAPI.getXP(message.guild.id, mention);
    if (!playerXP) {
        return message.reply('Not possible! You have to gain xp first.').catch(err => {});
    }

    const levelSettings = await levelAPI.getLevelSettingsFromGuild(message.guild.id);

    const rank = new canvacord.Rank()
        .setAvatar(user.avatarURL({ format: 'jpg' }))
        .setCurrentXP(parseInt(playerXP.xp))
        .setStatus("dnd")
        .setProgressBar("#FFFFFF", "COLOR")
        .setUsername(user.username)
        .setDiscriminator(user.discriminator);

    if(levelSettings) {
        const nextLevel = await levelAPI.getNextLevel(levelSettings, playerXP.level_announce);
        rank.setRequiredXP(nextLevel.needXP)
    }

    rank.build()
    .then(data => {
        const attachment = new MessageAttachment(data, "RankCard.png");
        message.channel.send({
            files: [attachment]
        });
    });
}

module.exports.help = cmd_help.levelsystem.rank