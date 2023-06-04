const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
const { disconnectConfig } = require('../_config/music/disconnect');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    const check = await musicApi.checkAvailibility();
    if (check) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(check)],
            ephemeral: true,
        });
    }

    await musicApi.disconnect(main_interaction.guild.id);

    return await main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(
                    global.t.trans(['success.music.disconnect'], main_interaction.guild.id)
                )
                .setColor(global.t.trans(['general.colors.success'])),
        ],
        ephemeral: true,
    });
};

module.exports.data = disconnectConfig;
