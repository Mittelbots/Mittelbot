const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { checkguildConfig } = require('../_config/utils/checkguild');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const userInput = main_interaction.options.getString('guildid');

    const guild = await bot.guilds.fetch(userInput);

    if (!guild) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.utils.checkGuild.serverNotFound'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const info = {
        name: guild.name, //
        members: guild.memberCount, //
        channels: guild.channels.cache.size, //
        bans: guild.bans.cache.size, //
        roles: guild.roles.cache.size, //
        isAvailable: guild.available, //
        shard: guild.shardId, //
        banner: guild.banner, //
        description: guild.description || 'None', //
        verificationLevel: guild.verificationLevel, //
        vanity: {
            URL: guild.vanityURLCode || 'None', //
            URLUses: guild.vanityURLUses || 'None', //
        },
        nsfwLevel: guild.nsfwLevel, //
        premiumSubscriptionCount: guild.premiumSubscriptionCount, //
        isLarge: guild.large, //
        afk: {
            timeout: guild.afkTimeout, //
            channel: guild.afkChannelId, //
        },
        premiumTier: guild.premiumTier, //
        explicitContentFilter: guild.explicitContentFilter, //\\
        botJoined: guild.joinedTimestamp, //
        maximumMembers: guild.maximumMembers, //
        maxVideoChannelUsers: guild.maxVideoChannelUsers, //
        rulesChannelId: guild.rulesChannelId, //
        publicUpdatesChannelId: guild.publicUpdatesChannelId, //\\
        preferredLocale: guild.preferredLocale, //
        owner: guild.ownerId, //
    };

    const embed = new EmbedBuilder()
        .setTitle(`---Get all informations about ${info.name} on Shard-Id ${info.shard}----`)
        .setDescription(
            `Disclaimer: This informations are public and accessable for every bot. I don't expose sensetive data!`
        );

    const embedFieldData = [
        info.isAvailable ? 'Yes' : 'No',
        info.description,
        info.verificationLevel + '',
        `<#${info.rulesChannelId}>`,
        info.members + '',
        info.channels + '',
        info.roles + '',
        info.bans + '',
        info.vanity.URL + '',
        info.vanity.URLUses + '',
        info.nsfwLevel + '',
        info.premiumSubscriptionCount + '',
        info.premiumTier + '',
        info.isLarge ? 'Yes' : 'No',
        info.maximumMembers + '',
        info.afk.timeout + '',
        `<#${info.afk.channel}>`,
        info.maxVideoChannelUsers + '',
        info.preferredLocale,
        `<@${info.owner}>`,
        `<t:${info.botJoined}:f>`,
    ];

    const translationFields = global.t.trans(
        ['info.utils.checkGuild.embed.fields'],
        main_interaction.guild.id
    );

    for (let i in embedFieldData) {
        embed.addFields({
            name: translationFields[i].name,
            value: embedFieldData[i],
            inline: true,
        });
    }

    if (info.banner) {
        embed.setImage(info.banner.url);
    }

    return main_interaction
        .followUp({
            embeds: [embed],
            ephemeral: true,
        })
        .catch((err) => {
            return main_interaction
                .followUp({
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
                .catch((err) => {});
        });
};

module.exports.data = checkguildConfig;
