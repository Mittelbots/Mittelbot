const { SlashCommandBuilder } = require("@discordjs/builders");
const { save_welcomechannelId, sendWelcomeSetting } = require("../../../utils/functions/data/welcomechannel");

module.exports.run = async ({main_interaction, bot}) => {

    switch(main_interaction.options.getSubcommand()) {
        case 'welcomemessage':
            let pass = false;
            await save_welcomechannelId({
                guild_id: main_interaction.guild.id,
                welcomechannel_id: main_interaction.options.getChannel('channel').id
            }).then(res => {
                pass = true;
                main_interaction.reply({
                    content: '✅ '+res,
                    ephemeral: true
                }).catch(err => {})
            }).catch(err => {
                main_interaction.reply({
                    content: '❌ '+err,
                    ephemeral: true
                }).catch(err => {})
            })
            if(!pass) return;

            sendWelcomeSetting({
                main_interaction,
            })
            break;
    }
}

module.exports.data = new SlashCommandBuilder()
	.setName('settings')
	.setDescription('All important settings which you can set, edit or remove.')
    .addSubcommand(command =>
        command
            .setName('welcomemessage')
            .setDescription('Set the welcome message and channel.')
            .addChannelOption(channel => 
                channel
                    .setName('channel')
                    .setDescription('The channel you want to set as welcome channel.')
                    .setRequired(true)
            )
    )
    