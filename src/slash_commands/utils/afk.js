const config = require('../../../src/assets/json/_config/config.json');
const {TextInputBuilder, SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { userAFK } = require('../../../utils/functions/data/variables');

<<<<<<< HEAD
module.exports.run = async ({ main_interaction, bot }) => {
    const isRemove = main_interaction.options.getBoolean('remove');
    const isUserAfk = userAFK.find(
        (u) => u.user_id === main_interaction.user.id && u.guild_id === main_interaction.guild.id
    );
    if (isRemove) {
        if (!isUserAfk) {
            return main_interaction.reply({
                content: `❌ You are not afk.`,
                ephemeral: true,
            });
        }

        userAFKuserAFK = userAFK.splice(userAFK.indexOf(isUserAfk), 1);

        return main_interaction
            .reply({
                content: `✅ You are no longer afk.`,
                ephemeral: true,
            })
            .catch((err) => {});
    } else {
        if (isUserAfk)
            return main_interaction
                .reply({
                    content: `❌ You are already afk. \`Reason: ${isUserAfk.reason}\` To remove your afk state add the remove option.`,
                    ephemeral: true,
                })
                .catch((err) => {});
=======
module.exports.run = async ({main_interaction, bot}) => {

    await main_interaction.deferReply({
        ephemeral: true
    })

    const isRemove = main_interaction.options.getBoolean('remove');
    const isUserAfk = userAFK.find(u => u.user_id === main_interaction.user.id && u.guild_id === main_interaction.guild.id);
    if(isRemove) {
        if(!isUserAfk) return main_interaction.followUp({
            content: `❌ You are not afk.`,
            ephemeral: true
        });

        userAFKuserAFK = userAFK.splice(userAFK.indexOf(isUserAfk), 1);

        return main_interaction.followUp({
            content: `✅ You are no longer afk.`,
            ephemeral: true
        }).catch(err => {})
    }else {

        if(isUserAfk) return main_interaction.followUp({
            content: `❌ You are already afk. \`Reason: ${isUserAfk.reason}\` To remove your afk state add the remove option.`,
            ephemeral: true
        }).catch(err => {})
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

        const modal = new ModalBuilder()
            .setTitle('Reason for your afk state.')
            .setCustomId('afk_modal')

        const textInput = new TextInputBuilder()
            .setLabel('Reason...')
            .setCustomId('afk_reason')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

        const first = new ActionRowBuilder().addComponents([textInput])
        modal.addComponents([first]);

<<<<<<< HEAD
        await main_interaction.showModal(modal);

        return main_interaction.reply({ content: `` });
=======
        main_interaction.showModal(modal);

>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
    }
}
module.exports.data = new SlashCommandBuilder()
	.setName('afk')
	.setDescription('Set you to afk.')
    .addBooleanOption(option =>
        option
        .setName('remove')
        .setDescription('Remove the afk status.')
        .setRequired(false)
    )