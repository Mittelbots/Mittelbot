const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Scam = require('~utils/classes/scam');
const { scamConfig, scamPerms } = require('../_config/admin/scam');
const { isURL } = require('validator');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermission = await main_interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
    );
    if (!hasPermission) {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.permissions.user.useCommand'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }

    const link = main_interaction.options.getString('link');
    const subcommand = main_interaction.options.getSubcommand();

    if (subcommand !== 'view' && !isURL(link)) {
        main_interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['error.input.invalidLink', link], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
        });
        return;
    }

    switch (subcommand) {
        case 'add':
            new Scam()
                .add({
                    value: link,
                    guild_id: main_interaction.guild.id,
                    guild_name: main_interaction.guild.name,
                    bot,
                    author: main_interaction.user,
                })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    return main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch(() => {});
                });
            break;

        case 'remove':
            new Scam()
                .remove({
                    value: link,
                    guild_id: main_interaction.guild.id,
                    guild_name: main_interaction.guild.name,
                    bot,
                    author: main_interaction.user,
                })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    return main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch(() => {});
                });
            break;
        case 'view':
            new Scam()
                .view({
                    value: link,
                    channel: main_interaction.channel,
                    author: main_interaction.user,
                })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    return main_interaction.reply({
                        content: err,
                        ephemeral: true,
                    });
                });
            break;
    }
};

module.exports.data = scamConfig;
module.exports.permissions = scamPerms;
