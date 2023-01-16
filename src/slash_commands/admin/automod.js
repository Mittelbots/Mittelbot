const { SlashCommandBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

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
                        content: `You already have the role \`${role.name}\` on the whitelist. If you want to remove it use the optional argument \`remove\`.`,
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

            if(!setting.antispam) {
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
                                : '✅ Successfully disabled antispam.',
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

            if(!setting.antiinvite) {
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
                                : '✅ Successfully disabled Anti-invite.',
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

            if(!setting.antilinks) {
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
                                : '✅ Successfully disabled Anti-Links.',
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

            if(!setting.antiinsults) {
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
                                : '✅ Successfully disabled Anti-Links.',
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

module.exports.data = new SlashCommandBuilder()
    .setName('automod')
    .setDescription('All settings related to automoderation.')

    .addSubcommand((command) =>
        command
            .setName('whitelistroles')
            .setDescription("Configure whitelist role which wont't be effected by the automod.")
            .addRoleOption((option) =>
                option.setName('role').setDescription('Enable/disable anti-spam.').setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('remove')
                    .setDescription('Select if you want to remove the role from the whitelist.')
                    .setRequired(false)
                    .addChoices({
                        name: 'remove',
                        value: 'remove',
                    })
            )
    )

    .addSubcommand((command) =>
        command
            .setName('antispam')
            .setDescription('Configure anti spam settings.')
            .addStringOption((option) =>
                option
                    .setName('enabled')
                    .setDescription('Enable/disable anti-spam.')
                    .setRequired(true)
                    .addChoices({
                        name: 'true',
                        value: 'true',
                    })
                    .addChoices({
                        name: 'false',
                        value: 'false',
                    })
            )
            .addStringOption((option) =>
                option
                    .setName('action')
                    .setDescription('Select an action to take.')
                    .setRequired(true)
                    .addChoices({
                        name: 'ban',
                        value: 'ban',
                    })
                    .addChoices({
                        name: 'kick',
                        value: 'kick',
                    })
                    .addChoices({
                        name: 'mute',
                        value: 'mute',
                    })
                    .addChoices({
                        name: 'delete',
                        value: 'delete',
                    })
                    .addChoices({
                        name: 'warn',
                        value: 'warn',
                    })
            )
    )

    .addSubcommand((command) =>
        command
            .setName('antiinvite')
            .setDescription('Prevent user from sending discord invite links.')
            .addStringOption((option) =>
                option
                    .setName('enabled')
                    .setDescription('Enable/disable anti-invite.')
                    .setRequired(true)
                    .addChoices({
                        name: 'true',
                        value: 'true',
                    })
                    .addChoices({
                        name: 'false',
                        value: 'false',
                    })
            )
            .addStringOption((option) =>
                option
                    .setName('action')
                    .setDescription('Select an action to take.')
                    .setRequired(true)
                    .addChoices({
                        name: 'ban',
                        value: 'ban',
                    })
                    .addChoices({
                        name: 'kick',
                        value: 'kick',
                    })
                    .addChoices({
                        name: 'mute',
                        value: 'mute',
                    })
                    .addChoices({
                        name: 'delete',
                        value: 'delete',
                    })
                    .addChoices({
                        name: 'warn',
                        value: 'warn',
                    })
            )
    )
    .addSubcommand((command) =>
        command
            .setName('antilinks')
            .setDescription('Prevent user from sending links.')
            .addStringOption((option) =>
                option
                    .setName('enabled')
                    .setDescription('Enable/disable links.')
                    .setRequired(true)
                    .addChoices({
                        name: 'true',
                        value: 'true',
                    })
                    .addChoices({
                        name: 'false',
                        value: 'false',
                    })
            )
            .addStringOption((option) =>
                option
                    .setName('action')
                    .setDescription('Select an action to take.')
                    .setRequired(true)
                    .addChoices({
                        name: 'ban',
                        value: 'ban',
                    })
                    .addChoices({
                        name: 'kick',
                        value: 'kick',
                    })
                    .addChoices({
                        name: 'mute',
                        value: 'mute',
                    })
                    .addChoices({
                        name: 'delete',
                        value: 'delete',
                    })
                    .addChoices({
                        name: 'warn',
                        value: 'warn',
                    })
            )
    )
    .addSubcommand((command) =>
        command
            .setName('antiinsults')
            .setDescription('Prevent user from sending all kind of links.')
            .addStringOption((option) =>
                option
                    .setName('enabled')
                    .setDescription('Enable/disable anti-invite.')
                    .setRequired(true)
                    .addChoices({
                        name: 'true',
                        value: 'true',
                    })
                    .addChoices({
                        name: 'false',
                        value: 'false',
                    })
            )
            .addStringOption((option) =>
                option
                    .setName('action')
                    .setDescription('Select an action to take.')
                    .setRequired(true)
                    .addChoices({
                        name: 'ban',
                        value: 'ban',
                    })
                    .addChoices({
                        name: 'kick',
                        value: 'kick',
                    })
                    .addChoices({
                        name: 'mute',
                        value: 'mute',
                    })
                    .addChoices({
                        name: 'delete',
                        value: 'delete',
                    })
                    .addChoices({
                        name: 'warn',
                        value: 'warn',
                    })
            )
            .addStringOption((option) =>
                option
                    .setName('words')
                    .setDescription(
                        'Add words to the insult list separated by comma. Example: "Insult,Insult2,Insult3"'
                    )
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('remove')
                    .setDescription('Select if you want to remove the given words from the list.')
                    .setRequired(false)
                    .addChoices({
                        name: 'True',
                        value: 'remove',
                    })
            )
    );
