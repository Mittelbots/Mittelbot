const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    const userInput = main_interaction.options.getString('guildid');

    const guild = await bot.guilds.fetch(userInput);

    if (!guild) {
        return main_interaction
            .reply({
                content: `This Server doesnt exists or i'm not a member of it. Please invite me to get further informations.`,
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
        )
        .addFields(
            {
                name: 'Is this server available?',
                value: info.isAvailable ? 'Yes' : 'No',
                inline: true,
            },
            {
                name: 'Guild Description',
                value: info.description,
                inline: true,
            },
            {
                name: 'Verification Level:',
                value: info.verificationLevel + '',
                inline: true,
            },
            {
                name: 'Rules Channel:',
                value: `<#${info.rulesChannelId}>`,
                inline: true,
            },
            {
                name: 'Member Count:',
                value: info.members + '',
                inline: true,
            },
            {
                name: 'Channel Count:',
                value: info.channels + '',
                inline: true,
            },
            {
                name: 'Roles Count:',
                value: info.roles + '',
                inline: true,
            },
            {
                name: 'Ban Count:',
                value: info.bans + '',
                inline: true,
            },
            {
                name: 'Vanity URL:',
                value: info.vanity.URL + '',
                inline: true,
            },
            {
                name: 'Vanity URL uses:',
                value: info.vanity.URLUses + '',
                inline: true,
            },
            {
                name: 'NSFW Level:',
                value: info.nsfwLevel + '',
                inline: true,
            },
            {
                name: 'Server Boosts:',
                value: info.premiumSubscriptionCount + '',
                inline: true,
            },
            {
                name: 'Server Boost Level:',
                value: info.premiumTier + '',
                inline: true,
            },
            {
                name: 'Ban Count:',
                value: info.bans + '',
                inline: true,
            },
            {
                name: 'Is the server a large one?',
                value: info.isLarge ? 'Yes' : 'No',
                inline: true,
            },
            {
                name: 'User Limit:',
                value: info.maximumMembers + '',
                inline: true,
            },
            {
                name: 'Ban Count:',
                value: info.bans + '',
                inline: true,
            },
            {
                name: 'AFK Timer:',
                value: info.afk.timeout + '',
                inline: true,
            },
            {
                name: 'AFK Channel:',
                value: `<#${info.afk.channel}>`,
                inline: true,
            },
            {
                name: 'Video Channel User Limit:',
                value: info.maxVideoChannelUsers + '',
                inline: true,
            },
            {
                name: 'Prefered Location:',
                value: info.preferredLocale,
                inline: true,
            },
            {
                name: 'Owner',
                value: `<@${info.owner}>`,
                inline: true,
            },
            {
                name: 'I joined at:',
                value: `<t:${info.botJoined}:f>`,
                inline: true,
            }
        );

    if (info.banner) {
        embed.setImage(info.banner);
    }

    return main_interaction
        .reply({
            embeds: [embed],
            ephemeral: true,
        })
        .catch((err) => {
            main_interaction
                .reply({
                    content: "Something went wrong. I can't send you the message.",
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('checkguild')
    .setDescription('Get informations about another guild. (I must be a member of this guild!')
    .addStringOption((option) =>
        option.setName('guildid').setDescription('Enter the guild id.').setRequired(true)
    );
