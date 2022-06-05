const { SlashCommandBuilder } = require("@discordjs/builders");
const { getConfig, updateConfig } = require("../../../utils/functions/data/getConfig");

module.exports.run = async ({main_interaction, bot}) => {
    
    const hasPermission = await main_interaction.member.permissions.has('ADMINISTRATOR');
    if(!hasPermission) {
        return main_interaction.reply({
            content: lang.errors.noperms,
            ephemeral: true
        }).catch(err => {})
    }

    const module = main_interaction.options.getString('module');
    const status = main_interaction.options.getString('status');

    var {disabled_modules} = await getConfig({
        guild_id: main_interaction.guild.id,
    });

    disabled_modules = JSON.parse(disabled_modules);

    if(disabled_modules.indexOf(module) > -1 && status !== 'activate') {
        return main_interaction.reply({
            content: `${module} is aready disabled.`,
            ephemeral: true
        }).catch(err => {});
    }

    if(status === 'activate') {
        try {
            disabled_modules.splice(disabled_modules.indexOf(module), 1);
        }catch(e) {
            console.log(err)
        }
    }else {
        disabled_modules.push(module);
    }

    const updated = await updateConfig({
        guild_id: main_interaction.guild.id,
        value: JSON.stringify(disabled_modules),
        valueName: 'disabled_modules'
    });

    if(updated) {
        return main_interaction.reply({
            content: `✅ ${module} ${(status === 'activate') ? 'activated' : 'disabled'}`,
            ephemeral: true
        }).catch(err => {});
    }else {
        return main_interaction.reply({
            content: `❌ Something went wrong!`,
            ephemeral: true
        }).catch(err => {});
    }
}

module.exports.data = new SlashCommandBuilder()
	.setName('modules')
	.setDescription('Activate or deactivate modules')
    .addStringOption(option =>
        option
            .setName('module')
            .setDescription('The module you want to activate or deactivate')
            .addChoices({
                name: 'Fun',
                value: 'fun'
            })
            .addChoices({
                name: 'Moderation',
                value: 'moderation'
            })
            .addChoices({
                name: 'Level',
                value: 'level'
            })
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('status')
            .setDescription('Activate or deactivate the module')
            .addChoices({
                name: 'Activate',
                value: 'activate'
            })
            .addChoices({
                name: 'Deactivate',
                value: 'deactivate'
            })
            .setRequired(true)
    )