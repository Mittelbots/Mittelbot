const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { stopConfig } = require('../_config/music/stop');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply();

    const check = await musicApi.checkAvailibility();
    if (check) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(check)],
            ephemeral: true,
        });
    }

    const queue = await musicApi.getQueue();

    if (!queue) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.music.nothingInQueue'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    Promise.all([musicApi.disconnect(), musicApi.destroy(main_interaction.guild.id)]).catch(
        async (err) => {
            await main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(global.t.trans(['error.general']))
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        }
    );

    await main_interaction
        .followUp({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['success.music.stop.stopped'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.success'])),
            ],
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = stopConfig;
