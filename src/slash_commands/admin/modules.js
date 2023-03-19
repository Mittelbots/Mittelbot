const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const Modules = require('../../../utils/functions/data/Modules');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermission = await main_interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
    );
    if (!hasPermission) {
        return main_interaction
            .reply({
                content: config.errormessages.nopermission,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const module = main_interaction.options.getString('module');
    const status = main_interaction.options.getString('status');

    const moduleApi = new Modules(main_interaction.guild.id, bot);
    const isEnabled = await moduleApi.checkEnabled(module).catch(() => {
        return false;
    });

    if (isEnabled && status !== 'activate') {
        return main_interaction
            .reply({
                content: `${module} is already enabled.`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    await moduleApi.manageDisable(module, status === 'activate' ? false : true).then(() => {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Module')
                        .setDescription(
                            `✅ ${module[0].toUpperCase() + module.slice(1)} ${
                                status === 'activate' ? 'activated' : 'disabled'
                            }`
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
            .addChoices({
                name: 'Fun',
                value: 'fun',
            })
            .addChoices({
                name: 'Moderation',
                value: 'moderation',
            })
            .addChoices({
                name: 'Level',
                value: 'level',
            })
            .addChoices({
                name: 'Scamdetection',
                value: 'scamdetection',
            })
            .addChoices({
                name: 'Welcomemessage',
                value: 'welcomemessage',
            })
            .addChoices({
                name: 'Autotranslate',
                value: 'autotranslate',
            })
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
