const config = require('../../../src/assets/json/_config/config.json');

const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const levelAPI = require('../../../utils/functions/levelsystem/levelsystemAPI');
const { log } = require('../../../logs');

const canvacord = require("canvacord");
const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports.run = async ({main_interaction, bot}) => {
    const user = main_interaction.options.getUser('user') || main_interaction.user; 
    const anonymous = main_interaction.options.getBoolean('anonymous');


    const playerXP = await levelAPI.getXP(main_interaction.guild.id, user.id);

    if (!playerXP) {
        return main_interaction.reply({
            content: 'Not possible! You have to gain xp first.',
            ephemeral: true
        }).catch(err => {});
    }

    const levelSettings = await levelAPI.getLevelSettingsFromGuild(main_interaction.guild.id);

    const rank = new canvacord.Rank()
        .setAvatar(user.avatarURL({ format: 'jpg' }))
        .setCurrentXP(parseInt(playerXP.xp))
        .setStatus("online")
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
        main_interaction.reply({
            files: [attachment],
            ephemeral: (anonymous) ? true : false
        }).catch(err => {
            return errorhandler(err, config.errormessages.nopermissions.sendFiles, main_interaction.channel, log, config);
        });
    });
}

module.exports.data = new SlashCommandBuilder()
	.setName('rank')
	.setDescription('Get your or another user\'s rank.')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('The user to get the rank of.')
        .setRequired(false)
        )
    .addBooleanOption(option =>
        option.setName('anonymous')
        .setDescription('Set this to true if you want to hide the response from the user')
        .setRequired(false)
        )