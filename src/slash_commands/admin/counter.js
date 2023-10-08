const { EmbedBuilder } = require('discord.js');
const Counter = require('~utils/classes/Counter/Counter');
const { counterConfig, counterPerms } = require('../_config/admin/counter');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true });

    const command = main_interaction.options.getSubcommand();

    const counterApi = new Counter();
    const counter = await counterApi.get(main_interaction.guild.id).catch((err) => {
        return main_interaction.followUp({ content: err, ephemeral: true });
    });

    if (command === 'remove') {
        if (!counter) {
            return main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.admin.counter.notFound'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            });
        }

        return await counterApi
            .delete(main_interaction.guild.id)
            .then(() => {
                return main_interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.fun.counter.removed'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                    ephemeral: true,
                });
            })
            .catch((err) => {
                return main_interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                });
            });
    }

    const channel = main_interaction.options.getChannel('channel');
    const channel_id = channel.id;

    if (counter) {
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            ['error.admin.counter.alreadyExists'],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });
    }

    return await counterApi
        .create(main_interaction.guild.id, channel_id)
        .then(() => {
            return main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['success.fun.counter.set', channel],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            });
        })
        .catch((err) => {
            return main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.generalWithMessage', err],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            });
        });
};

module.exports.data = counterConfig;
module.exports.permissions = counterPerms;
