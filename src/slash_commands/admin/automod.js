const { SlashCommandBuilder } = require("@discordjs/builders");
const { getAutomodbyGuild, updateAutoModbyGuild } = require("../../../utils/functions/data/automod");

module.exports.run = async ({main_interaction, bot}) => {

    var setting = await getAutomodbyGuild(main_interaction.guild.id);

    setting = JSON.parse(setting);

    switch(main_interaction.options.getSubcommand()) {
        case "antispam":
            setting.antispam.enabled = JSON.parse(main_interaction.options.getString('enabled')),
            setting.antispam.action = main_interaction.options.getString('action')

            updateAutoModbyGuild({
                guild_id: main_interaction.guild.id,
                value: JSON.stringify(setting),
                type: setting.antispam.action
            }).then(res => {
                main_interaction.reply({
                    content: (setting.antispam.enabled) ? res : "✅ Successfully disabled antispam.",
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {});
            });
            break;

    }

}

module.exports.data = new SlashCommandBuilder()
	.setName('automod')
	.setDescription('All settings related to automoderation.')

    .addSubcommand(command =>
        command.setName('antispam')
        .setDescription('Configure anti spam settings.')
        .addStringOption(option =>
            option
            .setName('enabled')
            .setDescription('Enable/disable anti-spam.')
            .setRequired(true)
            .addChoices({
                name: 'true',
                value: 'true'
            })
            .addChoices({
                name: 'false',
                value: 'false'
            })
        )
        .addStringOption(option =>
            option
            .setName('action')
            .setDescription('Select an action to take.')
            .setRequired(true)
            .addChoices({
                name: 'ban',
                value: 'ban'
            })
            .addChoices({
                name: 'kick',
                value: 'kick'
            })
            .addChoices({
                name: 'mute',
                value: 'mute'
            })
            .addChoices({
                name: 'delete',
                value: 'delete'
            })
            .addChoices({
                name: 'none',
                value: 'none'
            })
        )
    )