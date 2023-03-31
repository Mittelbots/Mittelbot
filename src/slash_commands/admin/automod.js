const { EmbedBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { autoModConfig } = require('../_config/admin/automod');

module.exports.run = async ({ main_interaction, bot }) => {
    const setting = await Automod.get(main_interaction.guild.id);

    switch (main_interaction.options.getSubcommand()) {
        case 'whitelistroles':
            if (!setting.whitelistrole) {
                setting.whitelistrole = {
                    roles: [],
                };
            }
            const role = main_interaction.options.getRole('role');
            const remove = main_interaction.options.getString('remove');

            if (remove) {
                setting.whitelistrole.roles = setting.whitelistrole.roles.filter(
                    (r) => r !== role.id
                );
            } else {
                const alreadyExists = Automod.checkWhitelist({
                    setting: setting,
                    role_id: role.id,
                });
                if (alreadyExists)
                    return main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.automod.whitelistroles.alreadyExists', role.name],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    });
                setting.whitelistrole.roles.push(role.id);
            }

            Automod.update({
                guild_id: main_interaction.guild.id,
                value: setting,
                type: role,
            })
                .then((res) => {
                    errorhandler({
                        fatal: false,
                        message: `${main_interaction.guild.id} has been updated the automod config.`,
                    });
                    main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });

            break;

        case 'antispam':
            const antiSpamEnabled = JSON.parse(main_interaction.options.getString('enabled'));
            const antiSpamAction = main_interaction.options.getString('action');

            setting.antispam.action = main_interaction.options.getString('action');

            if (!setting.antispam) {
                setting.antispam = {
                    enabled: antiSpamEnabled,
                    action: antiSpamAction,
                };
            }

            setting.antispam.enabled = antiSpamEnabled;
            setting.antispam.action = antiSpamAction;

            Automod.update({
                guild_id: main_interaction.guild.id,
                value: setting,
                type: setting.antispam.action,
            })
                .then((res) => {
                    errorhandler({
                        fatal: false,
                        message: `${main_interaction.guild.id} has been updated the antispam config.`,
                    });
                    main_interaction
                        .reply({
                            content: setting.antispam.enabled
                                ? res
                                : global.t.trans(
                                      ['success.automod.antispam.disabled'],
                                      main_interaction.guild.id
                                  ),
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;

        case 'antiinvite':
            const antiInviteEnabled = JSON.parse(main_interaction.options.getString('enabled'));
            const antiInviteAction = main_interaction.options.getString('action');

            if (!setting.antiinvite) {
                setting.antiinvite = {
                    enabled: antiInviteEnabled,
                    action: antiInviteAction,
                };
            }

            setting.antiinvite.enabled = antiInviteEnabled;
            setting.antiinvite.action = antiInviteAction;

            Automod.update({
                guild_id: main_interaction.guild.id,
                value: setting,
                type: setting.antiinvite.action,
            })
                .then((res) => {
                    errorhandler({
                        fatal: false,
                        message: `${main_interaction.guild.id} has been updated the antiinvite config.`,
                    });
                    main_interaction
                        .reply({
                            content: setting.antiinvite.enabled
                                ? res
                                : global.t.trans(
                                      ['success.automod.antiinvite.disabled'],
                                      main_interaction.guild.id
                                  ),
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;

        case 'antilinks':
            const antiLinksEnabled = JSON.parse(main_interaction.options.getString('enabled'));
            const antiLinksAction = main_interaction.options.getString('action');

            if (!setting.antilinks) {
                setting.antilinks = {
                    enabled: antiLinksEnabled,
                    action: antiLinksAction,
                };
                break;
            }

            setting.antilinks.enabled = antiLinksEnabled;
            setting.antilinks.action = antiLinksAction;

            Automod.update({
                guild_id: main_interaction.guild.id,
                value: setting,
                type: setting.antilinks.action,
            })
                .then((res) => {
                    errorhandler({
                        fatal: false,
                        message: `${main_interaction.guild.id} has been updated the antilinks config.`,
                    });
                    main_interaction
                        .reply({
                            content: setting.antilinks.enabled
                                ? res
                                : global.t.trans(
                                      ['success.automod.antilinks.disabled'],
                                      main_interaction.guild.id
                                  ),
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;

        case 'antiinsults':
            const antiInsultsEnabled = JSON.parse(main_interaction.options.getString('enabled'));
            const antiInsultsAction = main_interaction.options.getString('action');
            const words = main_interaction.options.getString('words');
            const removeWords = main_interaction.options.getString('remove');

            if (!setting.antiinsults) {
                setting.antiinsults = {
                    enabled: antiInsultsEnabled,
                    action: antiInsultsAction,
                };
                break;
            }

            setting.antiinsults.enabled = antiInsultsEnabled;
            setting.antiinsults.action = antiInsultsAction;
            if (setting.antiinsults.words === undefined)
                setting.antiinsults.words = [words.join(',')];
            setting.antiinsults.words = removeWords
                ? setting.antiinsults.words.filter((word) => word !== words)
                : [...setting.antiinsults.words, words.join(',')];

            Automod.update({
                guild_id: main_interaction.guild.id,
                value: setting,
                type: setting.antiinsults.action,
            })
                .then((res) => {
                    errorhandler({
                        fatal: false,
                        message: `${main_interaction.guild.id} has been updated the anti Insults config.`,
                    });
                    main_interaction
                        .reply({
                            content: setting.antiinsults.enabled
                                ? res
                                : global.t.trans(
                                      ['success.automod.anitinsults.disabled'],
                                      main_interaction.guild.id
                                  ),
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;
    }
};

module.exports.data = autoModConfig;
