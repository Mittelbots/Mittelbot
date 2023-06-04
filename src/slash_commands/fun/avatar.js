const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { avatarConfig } = require('../_config/fun/avatar');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply();

    const user = main_interaction.options.getUser('user') || main_interaction.user;

    const newEmbedBuilder = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`**Click to view ${user.username} Avatar in the browser**`)
        .setURL(`${user.displayAvatarURL()}`)
        .setImage(user.displayAvatarURL({ format: 'png' }) + '?size=1024')
        .setTimestamp();
    return main_interaction
        .followUp({
            embeds: [newEmbedBuilder],
        })
        .catch((err) => {
            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                })
                .catch((err) => {});
        });
};

module.exports.data = avatarConfig;
