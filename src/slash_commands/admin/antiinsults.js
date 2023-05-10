const { EmbedBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { antiInsultsConfig, antiInsultsPerms } = require('../_config/admin/antiinsults');

module.exports.run = async ({ main_interaction, bot }) => {
    let setting = await Automod.get(main_interaction.guild.id, 'antiinsults');
    await main_interaction.deferReply({ ephemeral: true });
    const { enabled: antiInsultsEnabled, action: antiInsultsAction } = main_interaction.options;
    const words = main_interaction.options.getString('words');
    const removeWords = main_interaction.options.getString('remove');

    setting = {
        enabled: antiInsultsEnabled,
        action: antiInsultsAction,
        words: setting.words || [],
    };

    if (removeWords) {
        setting.words = setting.words.filter((word) => word !== words);
    } else {
        setting.words.push(...words.split(','));
    }

    Automod.update({
        guild_id: main_interaction.guild.id,
        value: setting,
        type: 'antiinsults',
    })
        .then(() => {
            errorhandler({
                fatal: false,
                message: `${main_interaction.guild.id} has been updated the anti Insults config.`,
            });

            const description = removeWords
                ? global.t.trans(
                      ['success.automod.antiinsults.removed', setting.action],
                      main_interaction.guild.id
                  )
                : global.t.trans(
                      [
                          'success.automod.antiinsults.' +
                              (setting.enabled ? 'enabled' : 'disabled'),
                          words,
                      ],
                      main_interaction.guild.id
                  );

            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(description)
                            .setColor(
                                global.t.trans([
                                    'general.colors.' + (removeWords ? 'success' : 'error'),
                                ])
                            ),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        })
        .catch((err) => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        });
};

module.exports.data = antiInsultsConfig;
module.exports.permissions = antiInsultsPerms;
