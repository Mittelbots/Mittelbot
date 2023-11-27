const SingASong = require('~utils/classes/SingASong');
const { hasPermission } = require('~utils/functions/hasPermissions');
const { singasongConfig } = require('../_config/fun/singasong');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    return await main_interaction
        .reply({
            content: 'This command is currently disabled!',
            ephemeral: true,
        })
        .catch((err) => {});

    const singasong = new SingASong(main_interaction, bot);

    switch (main_interaction.options.getSubcommand()) {
        case 'start':
            const check = singasong.initCheck();

            if (typeof check === 'string') {
                return main_interaction.reply({ content: check, ephemeral: true });
            }

            singasong.start().catch((err) => {
                return main_interaction.reply({ content: err, ephemeral: true });
            });
            break;
        case 'view_my_points':
            const points = await singasong.getPointsFromUser(main_interaction.user.id);
            if (!points) {
                return main_interaction.reply({
                    embeds: [
                        new EmbedBuilder().setDescription(
                            global.t.trans(
                                ['error.fun.singasong.noPoints'],
                                main_interaction.guild.id
                            )
                        ),
                    ],
                    ephemeral: true,
                });
            }
            main_interaction.reply({
                embeds: [
                    new EmbedBuilder().setDescription(
                        global.t.trans(
                            ['info.fun.singasong.userPoints', points],
                            main_interaction.guild.id
                        )
                    ),
                ],
                ephemeral: true,
            });
            break;
        case 'view':
            main_interaction.reply({
                content: 'This command is currently disabled!',
                ephemeral: true,
            });
            break;
        case 'ban':
            const hasPermissions = await hasPermission({
                guild_id: main_interaction.guild.id,
                adminOnly: false,
                modOnly: true,
                user: main_interaction.user,
                bot,
            });
            if (!hasPermissions) {
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
                    .catch((err) => {});
            }
            await singasong
                .banUser(main_interaction.options.getUser('user').id, main_interaction.guild.id)
                .then(() => {
                    main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.moderation.singasong.userHasBeenBanned'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    main_interaction.reply({ content: err, ephemeral: true });
                });
            break;
    }
};

module.exports.data = singasongConfig;
