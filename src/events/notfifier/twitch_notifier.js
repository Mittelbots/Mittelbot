const { ApiClient } = require('@twurple/api');
const { AppTokenAuthProvider } = require('@twurple/auth');
const { delay } = require('../../../utils/functions/delay/delay');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

const twitchStreams = require('../../db/Models/tables/twitchStreams.model');

const clientId = process.env.TT_CLIENT_ID;
const clientSecret = process.env.TT_SECRET;

const authProvider = new AppTokenAuthProvider(clientId, clientSecret);

module.exports.twitchApiClient = new ApiClient({
    authProvider,
});

const twitchApiClient = new ApiClient({
    authProvider,
});

async function isStreamLive(channel_id) {
    try {
        const streamer = await twitchApiClient.streams.getStreamByUserId(channel_id);
        return streamer !== null;
    } catch (err) {
        //ignore errors with reason self-signed certificate
        if (err.message.includes('self-signed certificate')) {
            return false;
        }

        errorhandler({
            err,
            fatal: false,
        });
        return false;
    }
}

module.exports.twitch_notifier = async ({ bot }) => {
    console.info('🔎 Twitch streams handler started');

    setInterval(async () => {
        const allTwitchAccounts = await twitchStreams
            .findAll()
            .then((res) => {
                return res;
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                return false;
            });

        if (!allTwitchAccounts || allTwitchAccounts.length === 0) return;

        for (let i in allTwitchAccounts) {
            if (!allTwitchAccounts[i].channel_id) continue;
            const isLive = await isStreamLive(allTwitchAccounts[i].channel_id);
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
                    .then(() => {
                        if (isLive) {
                            const guild = bot.guilds.cache.get(allTwitchAccounts[i].guild_id);
                            const channel = guild.channels.cache.get(
                                allTwitchAccounts[i].info_channel_id
                            );

                            const pingrole = guild.roles.cache.get(allTwitchAccounts[i].pingrole);
                            if (pingrole) {
                                var isEveryone = pingrole.name === '@everyone';
                            }

                            channel
                                .send({
                                    content:
                                        (pingrole
                                            ? isEveryone
                                                ? '@everyone '
                                                : `<@&${allTwitchAccounts[i].pingrole}> `
                                            : '') +
                                        `${allTwitchAccounts[i].channel_name} just went live! Go check it out https://twitch.tv/${allTwitchAccounts[i].channel_name}`,
                                })
                                .then(() => {
                                    errorhandler({
                                        err: `🔎 Twitch stream notification sent! Twitch Streamer: ${allTwitchAccounts[i].channel_name}`,
                                        fatal: false,
                                    });
                                })
                                .catch((err) => {
                                    errorhandler({
                                        err,
                                        fatal: false,
                                    });
                                });
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
    }, 600000);
};
