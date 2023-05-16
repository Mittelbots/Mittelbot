const { channelId } = require('@gonetone/get-youtube-id-by-url');
const { PermissionFlagsBits } = require('discord.js');
const guildUploads = require('../../../src/db/Models/tables/guildUploads.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const request = new (require('rss-parser'))();

module.exports.changeYtNotifier = async ({ ytchannel, dcchannel, pingrole, guild }) => {
    return new Promise(async (resolve, reject) => {
        const url = new URL('https://www.youtube.com' + '/' + ytchannel);
        if (url.pathname === '/@') {
            return reject(`❌ You have entered an invalid channel.`);
        }

        const channelid = await channelId(url.href)
            .then((id) => {
                return id;
            })
            .catch(() => {
                reject(`❌ I couldn't find the channel you have entered.`);
                return false;
            });
        if (!channelid) return;

        if (!guild.members.me) {
            await guild.members.fetch(process.env.DISCORD_APPLICATION_ID);
        }

        let hasChannelPerms = false;
        try {
            hasChannelPerms = dcchannel
                .permissionsFor(guild.members.me)
                .has([
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.MentionEveryone,
                ]);
        } catch (err) {
            errorhandler({
                err,
                fatal: true,
            });
            reject(`❌ Something went wrong while checking the permissions. Please try again.`);
            return false;
        }

        if (!hasChannelPerms) {
            return reject(
                `❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"\`. Change them and try again.`
            );
        }

        const allChannelsFromGuild = await guildUploads
            .findOne({
                where: {
                    guild_id: guild.id,
                },
            })
            .then((res) => {
                return {
                    error: false,
                    data: res,
                };
            })
            .catch((err) => {
                reject(
                    `❌ Something went wrong while selecting all youtube channels. Please contact the Bot support.`
                );
                return {
                    error: true,
                };
            });
        if (allChannelsFromGuild.error) return;
        if (allChannelsFromGuild.data) {
            return reject(`You already have a youtube channel. Please remove it first.`);
        }

        await request
            .parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelid}`)
            .then(async (feed) => {
                if (!feed.items[0])
                    return reject(
                        "❌ The channel you have entered does not have any videos or doesn't exists. Please try again with another channel."
                    );

                const latestVideo = [feed.items[0].link];
                guildUploads
                    .create({
                        guild_id: guild.id,
                        channel_id: channelid,
                        info_channel_id: dcchannel.id,
                        pingrole: pingrole ? pingrole.id : null,
                        uploads: latestVideo,
                    })
                    .then((res) => {
                        resolve(
                            '✅ Successfully added the youtube channel to the notification list.'
                        );
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                            fatal: true,
                        });
                        reject(
                            '❌ Something went wrong while adding the channel to the database. Please contact the Bot support.'
                        );
                    });
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                reject(
                    '❌ Something went wrong while fetching the youtube data. Please contact the Bot support or try again later.'
                );
            });
    });
};

module.exports.delYTChannelFromList = async ({ guild_id }) => {
    return new Promise(async (resolve, reject) => {
        guildUploads
            .destroy({
                where: {
                    guild_id,
                },
            })
            .then(() => {
                resolve(true);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
