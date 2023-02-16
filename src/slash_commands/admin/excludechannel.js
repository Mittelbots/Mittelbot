const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

const config = require('../../assets/json/_config/config.json');
const ExcludeChannel = require('../../../utils/functions/data/ExcludeChannel');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { EmbedBuilder } = require('discord.js');

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
    const excludeChannel = new ExcludeChannel(main_interaction, bot);

    const channel = main_interaction.options.getChannel('channel');
    const type = main_interaction.options.getString('type');

    if (subCommand === 'get') {
        excludeChannel
            .get(channel, type)
            .then((result) => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `✅ The channel is ${result ? '' : 'not'} excluded from ${
                                        typeTranslations[type]
                                    }`
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

        excludeChannel
            .set(channel, type, value)
            .then((result) => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `✅ The channel is now ${
                                        value ? '' : 'not'
                                    } excluded from ${type}`
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

module.exports.data = new SlashCommandBuilder()
    .setName('excludechannel')
    .setDescription('Exclude channels which are only allowed to use with the given type')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('get')
            .setDescription('Get the current exclude channel settings')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel to get the exclude channel settings')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('The type of the exclude channel')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'isOnlyMedia',
                            value: 'isOnlyMedia',
                        },
                        {
                            name: 'isOnlyText',
                            value: 'isOnlyText',
                        },
                        {
                            name: 'isOnlyEmotes',
                            value: 'isOnlyEmotes',
                        },
                        {
                            name: 'isOnlyStickers',
                            value: 'isOnlyStickers',
                        }
                    )
            )
    )

    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Set the exclude channel settings')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel to set the exclude channel settings')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('The type of the exclude channel')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'isOnlyMedia',
                            value: 'isOnlyMedia',
                        },
                        {
                            name: 'isOnlyText',
                            value: 'isOnlyText',
                        },
                        {
                            name: 'isOnlyEmotes',
                            value: 'isOnlyEmotes',
                        },
                        {
                            name: 'isOnlyStickers',
                            value: 'isOnlyStickers',
                        }
                    )
            )
            .addBooleanOption((option) =>
                option
                    .setName('value')
                    .setDescription('The value of the exclude channel')
                    .setRequired(true)
            )
    );
