const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const config = require('../../../src/assets/json/_config/config.json');
const { Infractions } = require('../../../utils/functions/data/Infractions');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .followUp({
                content: config.errormessages.nopermission,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    switch (main_interaction.options.getSubcommand()) {
        case 'all':
            const user = main_interaction.options.getUser('user');

            var closed = [];
            var open = [];

            const closed_infractions = await Infractions.getClosed({
                user_id: user.id,
                guild_id: main_interaction.guild.id,
            });

            const open_infractions = await Infractions.getOpen({
                user_id: user.id,
                guild_id: main_interaction.guild.id,
            });

            if (!closed_infractions || !open_infractions) {
                return main_interaction
                    .followUp({
                        content: config.errormessages.databasequeryerror,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            } else {
                closed = closed_infractions;
                open = open_infractions;
            }

            if (closed.length <= 0 && open.length <= 0) {
                return main_interaction
                    .followUp({
                        content: `${user} dont have any infractions!`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
            if (JSON.parse(process.env.DEBUG)) console.info('Infraction Command passed!');

            await publicInfractionResponse({
                member: user.id,
                closed: closed,
                open: open,
                main_interaction,
            });
            break;

        case 'view':
            const inf_id = main_interaction.options.getString('infractionid');

            const { infraction } = await Infractions.get({
                inf_id,
            });

            if (!infraction) {
                return main_interaction
                    .followUp({
                        content: `There is no infraction with this id \`${inf_id}\` `,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }

            const response = await publicInfractionResponse({
                guild: main_interaction.guild,
                isOne: true,
                infraction,
            });

            main_interaction
                .followUp({
                    embeds: [response.message],
                    ephemeral: true,
                })
                .catch((err) => {});
            break;

        case 'remove':
            const infraction_id = main_interaction.options.getString('infractionid');

            const { table } = await Infractions.get({
                inf_id: infraction_id,
            });

            if (table) {
                if (table === 'open') {
                    await Infractions.deleteOpen({ inf_id: infraction_id });
                } else {
                    await Infractions.deleteClosed({ inf_id: infraction_id });
                }

                return main_interaction
                    .followUp({
                        content: `Infraction with id \`${infraction_id}\` ${
                            response ? 'has been' : 'could not'
                        } be removed!`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            } else {
                return main_interaction
                    .followUp({
                        content: `Infraction with id \`${infraction_id}\` does not exist!`,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
            break;
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('See infractions of a user')
    .addSubcommand((command) =>
        command
            .setName('all')
            .setDescription('See all infractions of a user')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setRequired(true)
                    .setDescription('The user to see infractions of')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('view')
            .setDescription('View an specific infraction')
            .addStringOption((option) =>
                option
                    .setName('infractionid')
                    .setRequired(true)
                    .setDescription('The id of the infraction to view')
            )
    )
    .addSubcommand((command) =>
        command
            .setName('remove')
            .setDescription('Remove an specific infraction')
            .addStringOption((option) =>
                option
                    .setName('infractionid')
                    .setRequired(true)
                    .setDescription('The id of the infraction to remove')
            )
    );
