const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports.run = async ({main_interaction, bot}) => {
    const user = main_interaction.options.getUser('user') || main_interaction.user;

    const newEmbedBuilder = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`**Click to view ${user.username} Avatar**`)
        .setURL(`${user.displayAvatarURL()}`)
        .setImage(user.displayAvatarURL({ format: "png"}) + '?size=1024')
        .setTimestamp()
    return main_interaction.reply({
        embeds: [newEmbedBuilder]
    })
}

module.exports.data = new SlashCommandBuilder()
	.setName('avatar')
	.setDescription('Steel the avatar of a mentioned user')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('The user you want to steel the avatar of')
        .setRequired(false)
        )