const {
    TextInputBuilder,
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputStyle,
} = require('discord.js');
const { userAFK } = require('../../../utils/functions/data/variables');
const Afk = require('../../../utils/functions/data/Afk');

module.exports.run = async ({ main_interaction, bot }) => {
    const subcommand = main_interaction.options.getSubcommand();

    const afk = new Afk();
    const isUserAfk = await afk.isAfk(main_interaction.user.id, main_interaction.guild.id);

    if (subcommand === 'remove') {
        if (!isUserAfk) {
            return main_interaction.reply({
                content: `❌ You are not afk.`,
                ephemeral: true,
            });
        }

        await afk.remove(main_interaction.user.id, main_interaction.guild.id);

        return main_interaction
            .reply({
                content: `✅ You are no longer afk.`,
                ephemeral: true,
            })
            .catch((err) => {});
    } else {
        if (isUserAfk) {
            return main_interaction
                .reply({
                    content: `❌ You are already afk. \`Reason: ${isUserAfk.reason}\` To remove your afk state add the remove option.`,
                    ephemeral: true,
                })
                .catch((err) => {});
        }

        const modal = new ModalBuilder()
            .setTitle('Reason for your afk state.')
            .setCustomId('afk_modal');

        const textInput = new TextInputBuilder()
            .setLabel('Reason...')
            .setCustomId('afk_reason')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const first = new ActionRowBuilder().addComponents([textInput]);
        modal.addComponents([first]);

        await main_interaction.showModal(modal);

        return main_interaction.reply({ content: `` }).catch((err) => {});
    }
};
module.exports.data = new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set you to afk.')
    .addSubcommand((subcommand) => subcommand.setName('set').setDescription('Set your afk state.'))
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove your afk state.')
    );
