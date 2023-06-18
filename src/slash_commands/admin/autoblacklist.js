const { EmbedBuilder } = require('discord.js');
const AutoBlacklist = require('~utils/classes/AutoBlacklist');
const { autoBlacklistConfig, autoBlacklistPerms } = require('../_config/admin/autoblacklist');
const { escape } = require('validator');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getSubcommand();
    switch (type) {
        case 'info':
            const embed = new EmbedBuilder()
                .setTitle(
                    global.t.trans(
                        ['info.admin.autoblacklist.info.title'],
                        main_interaction.guild.id
                    )
                )
                .setDescription(
                    global.t.trans(
                        ['info.admin.autoblacklist.info.description'],
                        main_interaction.guild.id
                    )
                )
                .addFields(
                    global.t.trans(
                        ['info.admin.autoblacklist.info.fields'],
                        main_interaction.guild.id
                    )
                )
                .setImage('https://i.ibb.co/grCfwRw/autoblackllist-example.gif')
                .setTimestamp();
            main_interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
            break;
        case 'set':
            const channel = main_interaction.options.getChannel('channel');
            const ban_message = escape(main_interaction.options.getString('ban_message'));

            const autoBlacklist = new AutoBlacklist();

            const settings = await autoBlacklist.get(main_interaction.guild.id);
            if (settings)
                return main_interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.admin.autoblacklist.set.alreadySet'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                });

            autoBlacklist
                .set({
                    guild_id: main_interaction.guild.id,
                    channel: channel.id,
                    message: ban_message,
                })
                .then(() => {
                    main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.admin.autoblacklist.set'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    main_interaction.reply({
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
            break;

        case 'delete':
            const autoBlacklist2 = new AutoBlacklist();

            const settings2 = await autoBlacklist2.get(main_interaction.guild.id);
            if (!settings2)
                return main_interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.admin.autoblacklist.delete.notSet'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                });

            autoBlacklist2
                .delete(main_interaction.guild.id)
                .then(() => {
                    main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.admin.autoblacklist.delete'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(),
                        ],
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    main_interaction.reply({
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
            break;
    }
};

module.exports.data = autoBlacklistConfig;
module.exports.permissions = autoBlacklistPerms;
