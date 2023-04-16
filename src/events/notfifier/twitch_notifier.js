const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

const twitchStreams = require('../../db/Models/tables/twitchStreams.model');
const TwitchNotifier = require('../../../utils/functions/data/twitch');
const Notification = require('../../../utils/functions/data/Notifications/Notifications');

const twitchApi = new TwitchNotifier();

const ignoreErroCodes = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'EPIPE',
    'ENOTFOUND',
];

const interval = 1000 * 10; // 1 minute

let savedStreams = [];

module.exports.twitch_notifier = async ({ bot }) => {
    console.info('🔎 Twitch streams handler started');

    setInterval(async () => {
        const allTwitchAccounts = await twitchStreams.findAll().catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
            return false;
        });

        if (!allTwitchAccounts || allTwitchAccounts.length === 0) {
            console.info(
                `🔎 Twitch upload handler Interval has ended because there are no uploads to check`
            );
            return false;
        }

        for (let i in allTwitchAccounts) {
            if (!allTwitchAccounts[i].channel_id) continue;

            const stream = await twitchApi.getTwitchStream(allTwitchAccounts[i].channel_id);
            const isLive = !!stream;
            if (isLive === !!+allTwitchAccounts[i].isStreaming) {
                savedStreams.filter((s) => s.channel_id === allTwitchAccounts[i].channel_id);
                continue;
            }

            await twitchStreams
                .update(
                    {
                        isStreaming: isLive,
                    },
                    {
                        where: {
                            guild_id: allTwitchAccounts[i].guild_id,
                            channel_id: allTwitchAccounts[i].channel_id,
                        },
                    }
                )
                .then(async () => {
                    if (!isLive) {
                        const wasLive = savedStreams.filter(
                            (s) => s.channel_id === allTwitchAccounts[i].channel_id
                        );
                        if (wasLive.length === 0) return false;
                    }

                    console.info(
                        `🔎 Twitch stream handler checking streamer: ${allTwitchAccounts[i].channel_name}...`
                    );

                    const guild = bot.guilds.cache.get(allTwitchAccounts[i].guild_id);
                    const dc_channel = guild.channels.cache.get(
                        allTwitchAccounts[i].info_channel_id
                    );

                    const pingrole = guild.roles.cache.get(allTwitchAccounts[i].pingrole);
                    let isEveryone = false;
                    if (pingrole) {
                        isEveryone = pingrole.name === '@everyone';
                    }

                    const streamer = await twitchApi.getTwitchFromChannelName(
                        allTwitchAccounts[i].channel_name
                    );

                    const uptime = Math.floor(
                        (Date.now() - new Date(stream.started_at).getTime()) / 1000 / 60 / 60
                    );

                    const content = pingrole ? (isEveryone ? '@everyone' : `${pingrole}`) : '';

                    const notificationApi = new Notification();
                    const embed = await notificationApi
                        .geneateNotificationEmbed({
                            title: `${stream.title}`,
                            color: '#6441a5',
                            footer: {
                                text: `Stream started ${uptime} hours ago`,
                            },
                            image: stream.getThumbnailUrl(1920, 1080),
                            url: `https://twitch.tv/${stream.userDisplayName}`,
                            author: {
                                name: `${stream.userDisplayName} just went live on Twitch!`,
                                iconURL: streamer.profilePictureUrl,
                            },
                            fields: [
                                {
                                    name: 'Game',
                                    value: stream.gameName,
                                },
                                {
                                    name: 'Viewers',
                                    value: stream.viewers.toString(),
                                },
                                {
                                    name: 'Tags',
                                    value: stream.tags.join(', '),
                                },
                            ],
                        })
                        .catch((err) => {
                            errorhandler({
                                err,
                                fatal: true,
                            });
                        });

                    notificationApi
                        .sendNotification({
                            channel: dc_channel,
                            content,
                            embed,
                        })
                        .then(() => {
                            console.info(
                                `🔎 Twitch stream handler checked streamer: ${allTwitchAccounts[i].channel_name}...`
                            );
                            errorhandler({
                                err: `🔎 Twitch stream notification sent! Twitch Streamer: ${allTwitchAccounts[i].channel_name}`,
                                fatal: false,
                            });

                            savedStreams.push({
                                channel_id: allTwitchAccounts[i].channel_id,
                                isStreaming: isLive,
                                last_update: Date.now(),
                            });
                        })
                        .catch((err) => {
                            errorhandler({
                                err,
                                fatal: true,
                            });
                        });
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                });
        }
    }, interval); // 1 minute
};
