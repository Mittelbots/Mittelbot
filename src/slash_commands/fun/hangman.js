const {
    AttachmentBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { hangmanConfig } = require('../_config/fun/hangman');
const Hangman = require('../../../utils/functions/data/Games/Hangman/Hangman');

module.exports.run = async ({ main_interaction }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hangmanApi = new Hangman(main_interaction);

    if (await hangmanApi.get()) {
        return main_interaction.followUp({
            content: 'There is already a game of hangman running in this channel',
        });
    }

    const word = main_interaction.options.getString('word');
    const config = await hangmanApi.createConfig(word);
    const game = await hangmanApi.set(config);

    const privateEmbed = new EmbedBuilder()
        .setDescription(
            `You started an game of hangman in ${main_interaction.guild.name} (${main_interaction.channel})`
        )
        .addFields(
            {
                name: 'Word',
                value: `\`${game.config.word}\``,
                inline: true,
            },
            {
                name: 'Channel',
                value: `<#${game.channel_id}>`,
                inline: true,
            },
            {
                name: 'Lives',
                value: `\`${game.config.lives}\``,
            }
        )
        .setColor('#FF0000')
        .setTimestamp();

    const publicEmbed = new EmbedBuilder()
        .setDescription(`An game of hangman has been started in ${main_interaction.guild.name}`)
        .addFields(hangmanApi.generateEmbedFields(game))
        .addComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`hangman_cancel`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🚫')
            )
        )
        .setColor('#FF0000')
        .setTimestamp();

    main_interaction.followUp({
        embeds: [privateEmbed],
        ephemeral: true,
    });

    main_interaction.channel.send({
        embeds: [publicEmbed],
    });
};

module.exports.data = hangmanConfig;
