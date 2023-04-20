const { EmbedBuilder } = require('discord.js');
const { uptimeConfig } = require('../_config/utils/uptime');

module.exports.run = async ({ main_interaction, bot }) => {
    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);

    await main_interaction
        .reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['info.utils.uptime', days, hours, minutes, seconds])
                    )
                    .setColor(global.t.trans(['general.colors.info'])),
            ],
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = uptimeConfig;
