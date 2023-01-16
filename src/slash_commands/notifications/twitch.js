const { SlashCommandBuilder } = require('discord.js');
const {
    delTwChannelFromList,
    changeTwitchNotifier,
} = require('../../../utils/functions/data/twitch');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getSubcommand();

    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    switch (type) {
        case 'add':
            const twitchchannel = main_interaction.options.getString('twitchchannel');
            const twdcchannel = main_interaction.options.getChannel('dcchannel');
            const twpingrole = main_interaction.options.getRole('twitchping');

            changeTwitchNotifier({
                twitchchannel,
                twdcchannel,
                twpingrole,
                guild: main_interaction.guild,
            })
                .then((res) => {
                    main_interaction
                        .followUp({
                            content: res,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .followUp({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;
        case 'remove':
            const deltwchannel = main_interaction.options.getString('twitchchannel');

            delTwChannelFromList({
                guild_id: main_interaction.guild.id,
                deltwchannel,
            })
                .then((res) => {
                    main_interaction
                        .followUp({
                            content: res,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .followUp({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('twitch')
    .setDescription(
        'Add up to 3 twitch channels to get a notification when a new video is uploaded.'
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a twitch channel to the list.')
            .addStringOption((ytchannel) =>
                ytchannel
                    .setName('twitchchannel')
                    .setDescription('Add the twitch channel name.')
                    .setRequired(true)
            )
            .addChannelOption((dcchannel) =>
                dcchannel
                    .setName('dcchannel')
                    .setDescription(
                        'Select a text channel where the notification will be send it when the streamer is live.'
                    )
                    .setRequired(true)
            )
            .addRoleOption((warnrole) =>
                warnrole
                    .setName('twitchping')
                    .setDescription(
                        'Add a ping role to be pinged each time a the streamer is live.'
                    )
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove a twitch channel from the list.')
            .addStringOption((ytchannel) =>
                ytchannel
                    .setName('twitchchannel')
                    .setDescription('Add the twitch channel name.')
                    .setRequired(true)
            )
    );
