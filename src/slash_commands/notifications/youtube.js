const { SlashCommandBuilder } = require('discord.js');
const { changeYtNotifier, delYTChannelFromList } = require('../../../utils/functions/data/youtube');
const { youtubeConfig } = require('../_config/notifications/youtube');

module.exports.run = async ({ main_interaction, bot }) => {
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
        delYTChannelFromList({
            guild_id: main_interaction.guild.id,
        })
            .then(() => {
                main_interaction
                    .followUp({
                        content:
                            '✅ Successfully removed the youtube channel from the notification list. Now you can add a new one.',
                        ephemeral: true,
                    })
                    .catch((err) => {});
            })
            .catch(() => {
                main_interaction
                    .followUp({
                        content:
                            '❌ Something went wrong while removing the channel from the database. Please contact the Bot support.',
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
    }
};

module.exports.data = youtubeConfig;
