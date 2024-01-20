const TwitchNotifier = require('~utils/classes/Notifications/Twitch/TwitchLogic');
const { twitchConfig, twitchPerms } = require('../_config/notifications/twitch');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getSubcommand();

    await main_interaction.deferReply({ ephemeral: true }).catch(() => {});

    const clientId = process.env.TT_CLIENT_ID;
    const clientSecret = process.env.TT_SECRET;

    if (!clientId || !clientSecret) {
        main_interaction
            .followUp({
                content: 'The bot owner has not set up Twitch integration yet.',
                ephemeral: true,
            })
            .catch(() => {});
        return;
    }

    switch (type) {
        case 'add':
            const twitchchannel = main_interaction.options.getString('twitchchannel');
            const twdcchannel = main_interaction.options.getChannel('dcchannel');
            const twpingrole = main_interaction.options.getRole('twitchping');

            new TwitchNotifier()
                .change({
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
                        .catch(() => {});
                })
                .catch((err) => {
                    main_interaction
                        .followUp({
                            content: err,
                            ephemeral: true,
                        })
                        .catch(() => {});
                });
            break;
        case 'remove':
            const deltwchannel = main_interaction.options.getString('twitchchannel');

            new TwitchNotifier()
                .delete(main_interaction.guild.id, deltwchannel)
                .then((res) => {
                    main_interaction
                        .followUp({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    main_interaction
                        .followUp({
                            content: err,
                            ephemeral: true,
                        })
                        .catch(() => {});
                });
            break;
    }
};

module.exports.data = twitchConfig;
module.exports.permissions = twitchPerms;
