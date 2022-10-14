const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getStartConfig } = require('../../../utils/functions/data/guildConfig');
const { saveNewTranslateConfig } = require('../../../utils/functions/data/translate');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermission = await main_interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
    );
    if (!hasPermission) {
        return main_interaction
            .reply({
                content: config.errormessages.nopermission,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const alreadyStarted = await getStartConfig(main_interaction.guild.id);

    if (JSON.parse(alreadyStarted)) {
        await main();
    } else {
        return main_interaction
            .reply({
                content: 'You already have used this command.',
                ephemeral: true,
            })
            .catch((err) => {});
    }

    async function main() {}
};

module.exports.data = new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start setting up your guild as you want.');
