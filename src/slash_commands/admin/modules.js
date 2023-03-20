const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const Modules = require('../../../utils/functions/data/Modules');
const { EmbedBuilder } = require('discord.js');

const choices = Object.values(new Modules().getDefaultSettings()).map((el) => el.name);

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const hasPermission = await main_interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
    );
    if (!hasPermission) {
        return main_interaction
            .followUp({
                content: config.errormessages.nopermission,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const requestedModule = main_interaction.options.getString('module');
    const status = main_interaction.options.getString('status');

    if (!choices.includes(requestedModule)) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        `⚠️ ${
                            requestedModule[0].toUpperCase() + requestedModule.slice(1)
                        } is not a valid module`
                    ),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const moduleApi = new Modules(main_interaction.guild.id, bot);
    const isEnabled = await moduleApi.checkEnabled(requestedModule).catch(() => {
        return false;
    });

    if (isEnabled && status === 'activate') {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        `⚠️ ${
                            requestedModule[0].toUpperCase() + requestedModule.slice(1)
                        } is already enabled`
                    ),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (!isEnabled && status === 'deactivate') {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        `⚠️ ${
                            requestedModule[0].toUpperCase() + requestedModule.slice(1)
                        } is already disabled`
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
                            .setTitle('Module')
                            .setDescription(
                                `✅ ${
                                    requestedModule[0].toUpperCase() + requestedModule.slice(1)
                                } ${status === 'activate' ? 'activated' : 'disabled'}`
                            )
                            .setColor('DarkGreen'),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('modules')
    .setDescription('Activate or deactivate modules')
    .addStringOption((option) =>
        option
            .setName('module')
            .setDescription('The module you want to activate or deactivate')
            .setAutocomplete(true)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('status')
            .setDescription('Activate or deactivate the module')
            .addChoices({
                name: 'Activate',
                value: 'activate',
            })
            .addChoices({
                name: 'Deactivate',
                value: 'deactivate',
            })
            .setRequired(true)
    );

module.exports.autocomplete = async (interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    const filtered = choices.filter((choice) => choice.startsWith(focusedOption.value));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};
