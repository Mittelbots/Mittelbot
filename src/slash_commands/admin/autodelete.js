const { hasPermission } = require('../../../utils/functions/hasPermissions');

const config = require('../../assets/json/_config/config.json');
const Autodelete = require('../../../utils/functions/data/Autodelete');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { EmbedBuilder } = require('discord.js');
const { autoDeleteConfig } = require('../_config/admin/autodelete');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const typeTranslations = {
        isOnlyMedia: global.t.trans(['info.autodelete.types.onlyMedia'], main_interaction.guild.id),
        isOnlyText: global.t.trans(['info.autodelete.types.onlyText'], main_interaction.guild.id),
        isOnlyEmotes: global.t.trans(
            ['info.autodelete.types.onlyEmotes'],
            main_interaction.guild.id
        ),
        isOnlyStickers: global.t.trans(
            ['info.autodelete.types.onlyStickers'],
            main_interaction.guild.id
        ),
    };

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.permissions.user.useCommand'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const subCommand = main_interaction.options.getSubcommand();
    const autodelete = new Autodelete(main_interaction, bot);

    const channel = main_interaction.options.getChannel('channel');

    if (subCommand === 'get') {
        autodelete
            .get(channel)
            .then((result) => {
                const filtered = Object.keys(result.dataValues).filter(
                    (key) => result.dataValues[key] === true
                );

                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        [
                                            'warning.autodelete.get',
                                            result ? 'have to' : "don't have to",
                                            typeTranslations[filtered[0]],
                                        ],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor('#00FF00'),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            fatal: false,
                        });
                    });
            })
            .catch((err) => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder().setDescription(`❌ ${err}`).setColor('#FF0000'),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            fatal: false,
                        });
                    });
            });
    } else {
        const value = main_interaction.options.getBoolean('value');
        const type = main_interaction.options.getString('type');

        autodelete
            .set(channel, type, value)
            .then(() => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        [
                                            'success.autodelete.set',
                                            value ? 'have to' : "don't have to",
                                            typeTranslations[type],
                                        ],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor('#00FF00'),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            fatal: false,
                        });
                    });
            })
            .catch((err) => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder().setDescription(`❌ ${err}`).setColor('#FF0000'),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            fatal: false,
                        });
                    });
            });
    }
};

module.exports.data = autoDeleteConfig;
