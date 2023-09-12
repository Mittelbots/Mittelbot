const { EmbedBuilder } = require('discord.js');
const Automod = require('~utils/classes/Automod');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { autoModConfig, automodPerms } = require('../_config/admin/automod');

module.exports.run = async ({ main_interaction, bot }) => {
    const setting = await new Automod().get(main_interaction.guild.id, 'automod');

    switch (main_interaction.options.getSubcommand()) {
        case 'whitelistroles':
            if (!setting.whitelistrole) {
                setting.whitelistrole = {
                    roles: [],
                };
            }
            const role = main_interaction.options.getRole('role');
            const remove = main_interaction.options.getBoolean('remove');

            if (remove) {
                setting.whitelistrole.roles = setting.whitelistrole.roles.filter(
                    (r) => r !== role.id
                );
            } else {
                const alreadyExists = await new Automod().checkWhitelist({
                    setting: setting,
                    role_id: role.id,
                    guild_id: main_interaction.guild.id,
                });
                if (alreadyExists)
                    return main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        [
                                            'error.admin.automod.whitelistroles.alreadyExists',
                                            role.name,
                                        ],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    });
                setting.whitelistrole.roles.push(role.id);
            }

            new Automod()
                .update({
                    guild_id: main_interaction.guild.id,
                    value: setting,
                    type: 'whitelist',
                })
                .then((res) => {
                    errorhandler({
                        fatal: false,
                        message: `${main_interaction.guild.id} has been updated the automod config.`,
                        id: 1694432871,
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
    }
};

module.exports.data = autoModConfig;
module.exports.permissions = automodPerms;
