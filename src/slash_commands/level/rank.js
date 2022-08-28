const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');
const levelAPI = require('../../../utils/functions/levelsystem/levelsystemAPI');

const canvacord = require("canvacord");
const {
    AttachmentBuilder
} = require('discord.js');
const {
    SlashCommandBuilder
} = require('discord.js');
const levels = require('../../../utils/functions/levelsystem/levelconfig.json')

module.exports.run = async ({
    main_interaction,
    bot
}) => {

    await main_interaction.deferReply({
        ephemeral: true
    });

    const user = main_interaction.options.getUser('user') || main_interaction.user;
    const anonymous = main_interaction.options.getBoolean('anonymous');

    const playerXP = await levelAPI.getXP(main_interaction.guild.id, user.id);

    if (!playerXP) {
        return main_interaction.followUp({
            content: 'Not possible! You have to gain xp first.',
            ephemeral: true
        }).catch(err => {});
    }

    const levelSettings = await levelAPI.getLevelSettingsFromGuild(main_interaction.guild.id);

    var mode;
    try {
        mode = JSON.parse(levelSettings.mode)
    } catch (e) {
        mode = levelSettings.mode || "normal"
    }
    const nextLevel = await levelAPI.getNextLevel(levels[mode], playerXP.level_announce);

    const userRank = await levelAPI.getRankById({
        user_id: user.id,
        guild_id: main_interaction.guild.id
    });

    const rank = new canvacord.Rank()
        .setAvatar(user.avatarURL({
            format: 'jpg'
        }) || user.displayAvatarURL())
        .setCurrentXP(parseInt(playerXP.xp))
        .setStatus("online")
        .setProgressBar("#33ab43", "COLOR")
        .setUsername(user.username)
        .setDiscriminator(user.discriminator)
        .setRank(userRank)
        .setLevel(parseInt(playerXP.level_announce))
        .setStatus('online', true, '30')
        .setRequiredXP(nextLevel.xp)

    rank.build()
        .then(data => {
            const attachment = new AttachmentBuilder(data, "RankCard.png");
            main_interaction.followUp({
                files: [attachment],
                ephemeral: (anonymous) ? true : false
            }).catch(err => {
                return errorhandler({
                    err,
                    fatal: true
                });
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