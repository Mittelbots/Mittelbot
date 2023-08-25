const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { hangmanConfig } = require('../_config/fun/hangman');
const Hangman = require('~utils/classes/Games/Hangman/Hangman');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hangmanApi = new Hangman(main_interaction, bot);

    if (await hangmanApi.get(main_interaction.channel.id)) {
        main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            ['error.fun.hangman.alreadyRunningGameInChannel'],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });
        return;
    }

    const word = main_interaction.options.getString('word').toLowerCase();

    const wordRegex = /^[a-z]+$/;
    if (!wordRegex.test(word)) {
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['error.fun.hangman.noValidWord'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });
    }

    const config = await hangmanApi.createConfig(word);
    const game = await hangmanApi.set(config);

    const privateEmbed = new EmbedBuilder()
        .setDescription(
            global.t.trans(
                [
                    'success.fun.hangman.createdPrv',
                    main_interaction.guild,
                    main_interaction.channel,
                ],
                main_interaction.guild.id
            )
        )
        .addFields(
            {
                name: global.t.trans(
                    ['info.fun.hangman.embed.fields.word'],
                    main_interaction.guild.id
                ),
                value: `\`${game?.config?.word || 'Not Set'}\``,
                inline: true,
            },
            {
                name: global.t.trans(
                    ['info.fun.hangman.embed.fields.channel'],
                    main_interaction.guild.id
                ),
                value: `<#${game?.channel_id || 'Not Set'}>`,
                inline: true,
            },
            {
                name: global.t.trans(
                    ['info.fun.hangman.embed.fields.lives'],
                    main_interaction.guild.id
                ),
                value: `\`${game?.config?.lives || 0}\``,
            }
        )
        .setColor(global.t.trans(['general.colors.success']))
        .setTimestamp();

    const publicEmbed = new EmbedBuilder()
        .setDescription(
            global.t.trans(
                ['success.fun.hangman.createdPub', main_interaction.guild],
                main_interaction.guild.id
            )
        )
        .addFields(hangmanApi.generateEmbedFields(game))
        .setColor(global.t.trans(['general.colors.success']))
        .setTimestamp();

    main_interaction.followUp({
        embeds: [privateEmbed],
        ephemeral: true,
    });

    main_interaction.channel
        .send({
            embeds: [publicEmbed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`hangman_cancel`)
                        .setLabel(
                            global.t.trans(
                                ['general.embed.buttons.cancel'],
                                main_interaction.guild.id
                            )
                        )
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🚫')
                ),
            ],
        })
        .then((msg) => {
            hangmanApi.update({ ...game.config, message_id: msg.id }, game.channel_id);
        });
};

module.exports.data = hangmanConfig;
