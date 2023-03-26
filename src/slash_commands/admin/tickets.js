const { EmbedBuilder } = require('discord.js');
const Tickets = require('../../../utils/functions/data/Tickets/Tickets');
const { ticketConfig } = require('../_config/admin/tickets');
const ticketModel = require('../../db/Models/tables/tickets.model');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const subcommand = main_interaction.options.getSubcommand();

    const channel = main_interaction.options.getChannel('channel');
    const description = main_interaction.options.getString('description');
    const category = main_interaction.options.getChannel('category');
    const close_category = main_interaction.options.getChannel('close_category');
    const ticket_description = main_interaction.options.getString('ticket_description');
    const message_link = main_interaction.options.getString('message_link');
    let moderator = main_interaction.options.getString('moderator');

    const ticketApi = new Tickets(bot, main_interaction);
    if (subcommand === 'create') {
        if (moderator) {
            moderator = removeMention(moderator).split(' ');
        }

        ticketApi
            .createSettings({
                channel: channel.id,
                description,
                category,
                close_category,
                moderator,
                ticket_description,
            })
            .then((res) => {
                main_interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(res)
                            .setColor(global.t.trans(['general.colors.success']))
                            .setTimestamp(),
                    ],
                    ephemeral: true,
                });
            })
            .catch((err) => {
                main_interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(err)
                            .setColor(global.t.trans(['general.colors.error']))
                            .setTimestamp(),
                    ],
                    ephemeral: true,
                });
            });
    } else if (subcommand === 'update') {
        const updated = await tickets.update().catch((err) => {
            main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Ticket System')
                        .setDescription('An error occured while updating the ticket system.')
                        .setColor('#FF0000')
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
            return false;
        });
        if (!updated) return;

        await main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Ticket System')
                    .setDescription('The ticket system has been updated successfully.')
                    .setColor('#00FF00')
                    .setTimestamp(),
            ],
            ephemeral: true,
        });
    } else {
        const deleted = await tickets.delete().catch((err) => {
            main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Ticket System')
                        .setDescription('An error occured while deleting the ticket system.')
                        .setColor('#FF0000')
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
            return false;
        });

        if (!deleted) return;

        await main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Ticket System')
                    .setDescription('The ticket system has been deleted successfully.')
                    .setColor('#00FF00')
                    .setTimestamp(),
            ],
            ephemeral: true,
        });
    }
};

module.exports.data = ticketConfig;
