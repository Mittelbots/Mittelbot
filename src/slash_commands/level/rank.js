const { AttachmentBuilder } = require('discord.js');
const levels = require('~assets/json/levelsystem/levelconfig.json');
const Levelsystem = require('~utils/classes/levelsystemAPI');
const { rankConfig } = require('../_config/level/rank');
const { EmbedBuilder } = require('discord.js');
const { RankCardBuilder, Font } = require('canvacord');

Font.loadDefault();

module.exports.run = async ({ main_interaction }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user') || main_interaction.user;

    const playerXP = await new Levelsystem().get({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
    });

    if (!playerXP) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.level.rank.nothingFound'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }
    const levelSettings = await new Levelsystem().getSetting(main_interaction.guild.id);

    const mode = levelSettings.mode || 'normal';
    const nextLevel = await new Levelsystem().getLevelOfUser(
        levels[mode],
        playerXP.level_announce,
        true
    );
    // const currentLevel = await new Levelsystem().getLevelOfUser(
    //     levels[mode],
    //     playerXP.level_announce
    // );

    const userRank = await new Levelsystem().getRank({
        user_id: user.id,
        guild_id: main_interaction.guild.id,
    });

    let avatarURL =
        user.avatarURL({
            format: 'jpg',
        }) || user.displayAvatarURL();

    if (avatarURL.endsWith('.gif')) {
        avatarURL = avatarURL.slice(0, -3) + 'png';
    }

    const rank = new RankCardBuilder()
        .setAvatar(avatarURL)
        .setDisplayName(user.username)
        .setStatus('online')
        .setOverlay(90)
        .setRank(userRank)
        .setLevel(playerXP.level_announce)
        .setCurrentXP(playerXP.xp)
        .setRequiredXP(nextLevel.xp);

    rank.build({
        format: 'png',
    }).then((data) => {
        const attachment = new AttachmentBuilder(data, 'RankCard.png');
        main_interaction
            .followUp({
                files: [attachment],
                ephemeral: true,
            })
            .catch(() => {});
    });
};

module.exports.data = rankConfig;
