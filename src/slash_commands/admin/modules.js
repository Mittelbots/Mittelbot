const Modules = require('~utils/classes/Modules');
const { EmbedBuilder } = require('discord.js');
const { modulesConfig, modulesPerms } = require('../_config/admin/modules');

const choices = Object.values(new Modules().getDefaultSettings()).map((el) => el.name);

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const requestedModule = main_interaction.options.getString('module');
    const status = main_interaction.options.getString('status');

    if (!choices.includes(requestedModule)) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        global.t.trans(
                            [
                                'warning.modules.notavalidmodule',
                                requestedModule[0].toUpperCase() + requestedModule.slice(1),
                            ],
                            main_interaction.guild.id
                        )
                    ),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const moduleApi = new Modules(main_interaction.guild.id, bot);
    const { enabled } = await moduleApi.checkEnabled(requestedModule).catch(() => {
        return false;
    });

    if (enabled && status === 'activate') {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        global.t.trans(
                            [
                                'warning.modules.isAlreadyEnabled',
                                requestedModule[0].toUpperCase() + requestedModule.slice(1),
                            ],
                            main_interaction.guild.id
                        )
                    ),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (!enabled && status === 'deactivate') {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        global.t.trans(
                            [
                                'warning.modules.isAlreadyDisabled',
                                requestedModule[0].toUpperCase() + requestedModule.slice(1),
                            ],
                            main_interaction.guild.id
                        )
                    ),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    await moduleApi
        .manageDisable(requestedModule, status === 'activate' ? false : true)
        .then(() => {
            return main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    [
                                        'success.admin.modules.update',
                                        status === 'activate' ? 'activated' : 'disabled',
                                        requestedModule[0].toUpperCase() + requestedModule.slice(1),
                                    ],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = modulesConfig;
module.exports.permissions = modulesPerms;

module.exports.autocomplete = async (interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    const filtered = choices.filter((choice) => choice && choice.startsWith(focusedOption.value));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};
