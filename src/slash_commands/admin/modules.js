const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { GuildConfig } = require('../../../utils/functions/data/Config');

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

    const guildConfig = await GuildConfig.get(main_interaction.guild_id);

    disabled_modules = guildConfig.disabled_modules;

    if (disabled_modules.indexOf(module) > -1 && status !== 'activate') {
        return main_interaction
            .reply({
                content: `${module} is aready disabled.`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (status === 'activate') {
        try {
            disabled_modules.splice(disabled_modules.indexOf(module), 1);
        } catch (e) {
            errorhandler({ err: e, fatal: true });
        }
    } else {
        disabled_modules.push(module);
    }

    const updated = await GuildConfig.update({
        guild_id: main_interaction.guild.id,
        value: JSON.stringify(disabled_modules),
        valueName: 'disabled_modules',
    });

    if (updated) {
        return main_interaction
            .reply({
                content: `✅ ${module[0].toUpperCase() + module.slice(1)} ${
                    status === 'activate' ? 'activated' : 'disabled'
                }`,
                ephemeral: true,
            })
            .catch((err) => {});
    } else {
        return main_interaction
            .reply({
                content: `❌ Something went wrong!`,
                ephemeral: true,
            })
            .catch((err) => {});
    }
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
