const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

const twitchStreams = require('../../db/Models/tables/twitchStreams.model');
const TwitchNotifier = require('../../../utils/functions/data/twitch');

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

        if (!allTwitchAccounts || allTwitchAccounts.length === 0) return;

        for (let i in allTwitchAccounts) {
            if (!allTwitchAccounts[i].channel_id) continue;
            const stream = await twitchApi.getTwitchStream(allTwitchAccounts[i].channel_id);
            const isLive = !!stream;
            if (isLive !== !!+allTwitchAccounts[i].isStreaming) {
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
                        if (isLive) {
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

                            twitchApi
                                .sendTwitchNotification({
                                    channel: dc_channel,
                                    data: {
                                        pingrole,
                                        isEveryone,
                                        channel_name: stream.userDisplayName,
                                        channel_logo: streamer.profilePictureUrl,
                                        title: stream.title,
                                        game: stream.gameName,
                                        viewers: stream.viewers,
                                        thumbnail_url: stream.getThumbnailUrl(1920, 1080),
                                        started_at: stream.startDate,
                                        tags: stream.tags,
                                    },
                                })
                                .then(() => {
                                    errorhandler({
                                        err: `🔎 Twitch stream notification sent! Twitch Streamer: ${allTwitchAccounts[i].channel_name}`,
                                        fatal: false,
                                    });
                                })
                                .catch((err) => {});
                        }
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            fatal: true,
                        });
                    });
            }
            await delay(1500);
        }
    }, interval); // 1 minute
};
