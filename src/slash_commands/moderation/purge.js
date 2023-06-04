const { delay } = require('~utils/functions/delay');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { purgeConfig, purgePerms } = require('../_config/moderation/purge');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction }) => {
    main_interaction.deferReply();

    const amount = main_interaction.options.getNumber('number');
    const maxLimit = 100;

    if (amount < 1 || amount >= maxLimit) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.moderation.purge.notAValidNumber', maxLimit],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
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
                    msg.delete().catch(() => {});
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
                .catch(() => {});
        });
};

module.exports.data = purgeConfig;
module.exports.permissions = purgePerms;
