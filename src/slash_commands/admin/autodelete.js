const { hasPermission } = require('../../../utils/functions/hasPermissions');

const config = require('../../assets/json/_config/config.json');
const Autodelete = require('../../../utils/functions/data/Autodelete');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { EmbedBuilder } = require('discord.js');
const { autoDeleteConfig } = require('../_config/admin/autodelete');

const typeTranslations = {
    isOnlyMedia: 'Media',
    isOnlyText: 'Text',
    isOnlyEmotes: 'Emotes',
    isOnlyStickers: 'Stickers',
};

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

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
                content: `${config.errormessages.nopermission}`,
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
                                    `⚠️ Users ${
                                        result ? 'have to' : "don't have to"
                                    } send messages of type ${typeTranslations[filtered[0]]}`
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
                                    `✅ Users ${
                                        value ? 'have to' : "don't have to"
                                    } send messages of type ${typeTranslations[type]}`
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
