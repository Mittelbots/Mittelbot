const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { version } = require('../../../package.json');
const MemberInfo = require('~utils/classes/MemberInfo');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { infoConfig } = require('../_config/utils/info');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const server = main_interaction.guild;

    const userOption = main_interaction.options.getUser('user');
    const isAnonym = main_interaction.options.getBoolean('anonymous');

    const tag = userOption ? true : false;

    const user = userOption || main_interaction.user;

    let userRole = '';

    server.roles.cache.forEach((role) => {
        const searchedRole = server.roles.cache
            .get(role.id)
            .members.map((m) => m.user.id)
            .filter((m) => m === user.id);

        if (
            userRole.includes(searchedRole) ||
            server.roles.cache.get(role.id).name === '@everyone' ||
            server.roles.cache.get(role.id).name === bot.user.username
        )
            return;

        if (searchedRole.filter((e) => e === user.id)) {
            userRole += ` <@&${server.roles.cache.get(role.id).id}> `;
        }
    });

    if (userRole == '') userRole = 'No Roles';

    function convertDateToDiscordTimestamp(dateImport) {
        const date = new Intl.DateTimeFormat('de-DE').format(dateImport).split('.');
        const converteDate = new Date(date[2], date[1] - 1, date[0]);

        return Math.floor(converteDate / 1000);
    }

    function format(sec) {
        function pad(s) {
            return (s < 10 ? '0' : '') + s;
        }
        const hours = Math.floor(sec / (60 * 60));
        const minutes = Math.floor((sec % (60 * 60)) / 60);
        const seconds = Math.floor(sec % 60);

        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    }

    const serverInfoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`**Serverinfos - ${server.name}**`)
        .setURL('https://heeeeeeeey.com/')
        .setThumbnail(server.iconURL())
        .setDescription(`${server.id}`)
        .addFields([
            { name: `Owner: `, value: `<@${server.ownerId}>`, inline: true },
            { name: `Channels`, value: `${server.channels.cache.size}`, inline: true },
            { name: `Members`, value: `${server.members.cache.size}`, inline: true },
            { name: `Roles`, value: `${server.roles.cache.size}`, inline: true },
            {
                name: `Server created`,
                value: `${new Intl.DateTimeFormat('de-DE').format(
                    server.createdAt
                )} \n<t:${convertDateToDiscordTimestamp(server.createdAt)}:R>`,
                inline: true,
            },
            { name: `Bot Uptime`, value: `${format(process.uptime())}`, inline: true },
            { name: `Bot Version`, value: `${version}`, inline: true },
            { name: `Bot created`, value: `<t:1639142014:R>`, inline: true },
            { name: '\u200B', value: '\u200B' },
        ])
        .setTimestamp();

    if (!tag) {
        return main_interaction
            .followUp({
                embeds: [serverInfoEmbed],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel('Add the bot to your server')
                            .setURL(`https://mittelbot.xyz/invite`)
                    ),
                ],
                ephemeral: true,
            })
            .catch((err) => {
                errorhandler({ err });
            });
    }
    const memberInfo = await new MemberInfo().get({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
    });

    const user_joined = memberInfo ? memberInfo.joined_at : null;

    let dc_joinedAt;
    try {
        dc_joinedAt =
            new Intl.DateTimeFormat('de-DE').format(
                server.members.cache.find((member) => member.id === user.id).joinedAt
            ) +
            `\n<t:${convertDateToDiscordTimestamp(
                server.members.cache.find((member) => member.id === user.id).joinedAt
            )}:R>`;
    } catch (err) {
        dc_joinedAt = 'Not in this server';
    }

    let first_joined_at;
    try {
        first_joined_at = `${
            !user_joined
                ? 'Not saved in Database'
                : new Intl.DateTimeFormat('de-DE').format(new Date(user_joined.slice(0, 9)))
        } ${user_joined ? ` \n<t:${Math.floor(new Date(user_joined.slice(0, 9)) / 1000)}:R>` : ''}`;
    } catch (err) {
        errorhandler({ err });
        first_joined_at = 'Not saved in Database ||Error||';
    }

    const memberInfoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`**Memberinfos - ${user.username}**`)
        .addFields([
            { name: `Tag/ID: `, value: `<@${user.id}>/${user.id}` },
            {
                name: `Created at`,
                value: `${new Intl.DateTimeFormat('de-DE').format(
                    user.createdAt
                )} \n<t:${convertDateToDiscordTimestamp(user.createdAt)}:R>`,
                inline: true,
            },
            { name: `Last joined at`, value: `${dc_joinedAt}`, inline: true },
            { name: `First joined at`, value: `${first_joined_at}`, inline: true },
            { name: `Roles`, value: `${userRole}`, inline: true },
            { name: '\u200B', value: '\u200B' },
        ])
        .setTimestamp();

    if (process.env.NODE_ENV === 'development') console.info('info command passed!');

    const axios = require('axios');
    const pfp = axios
        .get(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`)
        .then(() => {
            // GIF
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`;
        })
        .catch(() => {
            // PNG
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`;
        });

    memberInfoEmbed.setThumbnail(await pfp);
    return main_interaction
        .followUp({
            embeds: [memberInfoEmbed],
            ephemeral: isAnonym ? true : false,
        })
        .catch((err) => {});
};

module.exports.data = infoConfig;
