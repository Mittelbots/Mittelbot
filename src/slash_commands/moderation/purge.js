const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { purgeConfig, purgePerms } = require('../_config/moderation/purge');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    main_interaction.deferReply();

    const amount = main_interaction.options.getNumber('number');

    if (amount < 1 || amount >= Number(config.bulkDeleteLimit)) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.purge.notAValidNumber', config.bulkDeleteLimit],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }
    await main_interaction.channel
        .bulkDelete(amount, true)
        .then(() => {
            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.moderation.purge.purged', amount],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                })
                .then(async (msg) => {
                    await delay(3000);
                    msg.delete().catch((err) => {});
                })
                .catch((err) => {});
        })
        .catch((err) => {
            errorhandler({ err });
            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = purgeConfig;
module.exports.permissions = purgePerms;
