const { SlashCommandBuilder } = require('discord.js');
const { delay } = require('~utils/functions/delay');
const { pingConfig } = require('../_config/utils/ping');

module.exports.run = async ({ main_interaction, bot }) => {
    main_interaction.reply({
        content: 'Pong!',
        ephemeral: true,
    });
    await delay(2000);
    return main_interaction.editReply(
        `Latency is ${
            Date.now() - main_interaction.createdTimestamp
        }ms. API Latency is ${Math.round(bot.ws.ping)}ms`
    );
};

module.exports.data = pingConfig;
