const { EmbedBuilder } = require('discord.js');
const Banappeal = require('~utils/classes/Banappeal');
const { banAppealConfig, banAppealPerms } = require('../_config/admin/banappeal');
const { escape } = require('validator');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true });

    const banappeal = new Banappeal(bot);

    const guild_id = main_interaction.guild.id;
    const command = main_interaction.options.getSubcommand();

    if (command === 'remove') {
        return banappeal
            .updateBanappealSettings(guild_id, null)
            .then(() => {
                main_interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.admin.banappeal.remove'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                    ephemeral: true,
                });
            })
            .catch(() => {
                main_interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                });
            });
    }

    const title = escape(main_interaction.options.getString('title'));
    const description = escape(main_interaction.options.getString('description'));
    const questions = main_interaction.options.getString('questions');
    const channel = main_interaction.options.getChannel('channel');
    const cooldown = main_interaction.options.getNumber('cooldown');

    const questions_array = questions.split(',');

    const settings = {
        title,
        description,
        questions: questions_array,
        channel_id: channel.id,
        cooldown: cooldown,
    };

    banappeal
        .updateBanappealSettings(guild_id, settings)
        .then(() => {
            const exampleEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor('#f44336');

            for (let i in questions_array) {
                exampleEmbed.addFields({
                    name: `Question ${parseInt(i, 10) + 1}`,
                    value: escape(questions_array[i]),
                });
            }

            main_interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['success.admin.banappeal.set'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            });

            channel
                .send({
                    embeds: [exampleEmbed],
                })
                .catch(() => {
                    main_interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.admin.banappeal.set'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor('#FF0000'),
                        ],
                        ephemeral: true,
                    });
                });
        })
        .catch(() => {
            main_interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.general'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            });
        });
};

module.exports.data = banAppealConfig;
module.exports.permissions = banAppealPerms;
