const canvacord = require('canvacord');
const { AttachmentBuilder } = require('discord.js');
const levels = require('../../../src/assets/json/levelsystem/levelconfig.json');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const { rankConfig } = require('../_config/level/rank');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user') || main_interaction.user;

    const playerXP = await Levelsystem.get({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
    });

    if (!playerXP) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.rank.nothingFound'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }
    const levelSettings = await Levelsystem.getSetting(main_interaction.guild.id);

    const mode = levelSettings.mode || 'normal';
    const nextLevel = await Levelsystem.getLevelOfUser(levels[mode], playerXP.level_announce, true);
    const currentLevel = await Levelsystem.getLevelOfUser(levels[mode], playerXP.level_announce);
    
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
        .setUsername(user.username)
        .setDiscriminator(user.discriminator)
        .setStatus('online', true, '30')
        .setProgressBar(['#240000', '#00e8ff'], 'GRADIENT')
        .setRank(userRank)
        .setLevel(playerXP.level_announce)
        .setCurrentXP(playerXP.xp)
        .setRequiredXP(nextLevel.xp)
        .setMinXP(currentLevel.xp)

    rank.build().then((data) => {
        const attachment = new AttachmentBuilder(data, 'RankCard.png');
        main_interaction
            .followUp({
                files: [attachment],
                ephemeral: true,
            })
            .catch((err) => {});
    });
};

module.exports.data = rankConfig;
