const {
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputStyle,
    EmbedBuilder,
} = require('discord.js');
const Afk = require('~utils/classes/Afk');
const { afkConfig } = require('../_config/utils/afk');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const subcommand = main_interaction.options.getSubcommand();

    const afk = new Afk();
    const isUserAfk = await afk.isAfk(main_interaction.user.id, main_interaction.guild.id);

    if (subcommand === 'remove') {
        if (!isUserAfk) {
            return main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.utils.afk.notAfk'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        }

        await afk.remove(main_interaction.user.id, main_interaction.guild.id);

        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['success.utils.afk.noLongerAfk'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    } else {
        if (isUserAfk) {
            return main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.utils.afk.alreadyAfk', isUserAfk.reason],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        }

        const modal = new ModalBuilder()
            .setTitle(global.t.trans(['info.utils.afk.modalTitle'], main_interaction.guild.id))
            .setCustomId('afk_modal');

        const textInput = new TextInputBuilder()
            .setLabel('Reason...')
            .setCustomId('afk_reason')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const first = new ActionRowBuilder().addComponents([textInput]);
        modal.addComponents([first]);

        await main_interaction.showModal(modal);

        return main_interaction.followUp({ content: `` }).catch((err) => {});
    }
};
module.exports.data = afkConfig;
