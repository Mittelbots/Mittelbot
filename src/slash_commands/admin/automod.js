const { SlashCommandBuilder } = require("@discordjs/builders");
const { getAutomodbyGuild, updateAutoModbyGuild, isRoleOnWhitelist } = require("../../../utils/functions/data/automod");

module.exports.run = async ({main_interaction, bot}) => {

    var setting = await getAutomodbyGuild(main_interaction.guild.id);

    setting = JSON.parse(setting);

    switch(main_interaction.options.getSubcommand()) {

        case 'whitelistroles':
            if(!setting.whitelistrole) {
                setting.whitelistrole = {
                    roles: [],
                }
            }
            const role = main_interaction.options.getRole('role');
            const remove = main_interaction.options.getString('remove');

            if(remove) {
                setting.whitelistrole.roles = setting.whitelistrole.roles.filter(r => r !== role.id);  
            }else {
                const alreadyExists = isRoleOnWhitelist({
                    setting: JSON.stringify(setting),
                    role_id: role.id,
                })
                if(alreadyExists) return main_interaction.reply({
                    content: `You already have the role \`${role.name}\` on the whitelist. If you want to remove it use the optional argument \`remove\`.`,
                    ephemeral: true
                });
                setting.whitelistrole.roles.push(role.id);
            }
            
            updateAutoModbyGuild({
                guild_id: main_interaction.guild.id,
                value: JSON.stringify(setting),
                type: role
            }).then(res => {
                main_interaction.reply({
                    content: res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: err,
                    ephemeral: true
                }).catch(err => {});
            });


            break;

        case "antispam":
            if(!setting.antispam) {
                setting.antispam = {
                    enabled: false,
                    action: ""
                }
            }

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
        command.setName('whitelistroles')
        .setDescription('Configure whitelist role which wont\'t be effected by the automod.')
        .addRoleOption(option =>
            option
            .setName('role')
            .setDescription('Enable/disable anti-spam.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName('remove')
            .setDescription('Select if you want to remove the role from the whitelist.')
            .setRequired(false)
            .addChoices({
                name: 'remove',
                value: 'remove'
            })
        )
    )

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