const { EmbedBuilder } = require('discord.js');
const { changeYtNotifier, delYTChannelFromList } = require('~utils/functions/data/youtube');
const { youtubeConfig, youtubePerms } = require('../_config/notifications/youtube');

module.exports.run = async ({ main_interaction }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const type = main_interaction.options.getSubcommand();
    if (type === 'add') {
        const ytchannel = main_interaction.options.getString('ytchannel');
        const dcchannel = main_interaction.options.getChannel('dcchannel');
        const pingrole = main_interaction.options.getRole('ytping');

        changeYtNotifier({
            ytchannel,
            dcchannel,
            pingrole,
            guild: main_interaction.guild,
        })
            .then((res) => {
                main_interaction.followUp({
                    content: res,
                    ephemeral: true,
                });
            })
            .catch((err) => {
                main_interaction.followUp({
                    content: err,
                    ephemeral: true,
                });
            });
    } else {
        const ytchannel = main_interaction.options.getString('ytchannel');

        delYTChannelFromList({
            guild_id: main_interaction.guild.id,
            ytchannel: ytchannel,
        })
            .then(async (res) => {
                await main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(res)
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            })
            .catch((err) => {
                return main_interaction
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
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
    }
};

module.exports.data = youtubeConfig;
module.exports.permissions = youtubePerms;
