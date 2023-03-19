const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

const canvacord = require('canvacord');
const { AttachmentBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const levels = require('../../../src/assets/json/levelsystem/levelconfig.json');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const Modules = require('../../../utils/functions/data/Modules');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user') || main_interaction.user;
    const anonymous = main_interaction.options.getBoolean('anonymous');

    const playerXP = await Levelsystem.get({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
    });

    if (!playerXP) {
        return main_interaction
            .followUp({
                content: '❌ I have nothing found for this user. Please gain some xp first.',
                ephemeral: true,
            })
            .catch((err) => {});
    }
    const levelSettings = await Levelsystem.getSetting(main_interaction.guild.id);

    const mode = levelSettings.mode || 'normal';
    const nextLevel = await Levelsystem.getNextLevel(levels[mode], playerXP.level_announce);

    const userRank = await Levelsystem.getRank({
        user_id: user.id,
        guild_id: main_interaction.guild.id,
    });

    const rank = new canvacord.Rank()
        .setAvatar(
            user.avatarURL({
                format: 'jpg',
            }) || user.displayAvatarURL()
        )
        .setCurrentXP(parseInt(playerXP.xp))
        .setStatus('online')
        .setProgressBar('#33ab43', 'COLOR')
        .setUsername(user.username)
        .setDiscriminator(user.discriminator)
        .setRank(userRank)
        .setLevel(parseInt(playerXP.level_announce))
        .setStatus('online', true, '30')
        .setRequiredXP(nextLevel.xp);

    rank.build().then((data) => {
        const attachment = new AttachmentBuilder(data, 'RankCard.png');
        main_interaction
            .followUp({
                files: [attachment],
                ephemeral: anonymous ? true : false,
            })
            .catch((err) => {
                return errorhandler({
                    err,
                    fatal: true,
                });
            });
    });
};

module.exports.data = new SlashCommandBuilder()
    .setName('rank')
    .setDescription("Get your or another user's rank.")
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to get the rank of.').setRequired(false)
    );
