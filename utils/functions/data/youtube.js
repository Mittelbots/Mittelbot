const { PermissionFlagsBits } = require('discord.js');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const YouTubeSettings = require('~utils/classes/Notifications/YouTube/YouTubeSettings');
const { hasPermissionsFor } = require('~utils/functions/permissions/permissions');

module.exports.changeYtNotifier = async ({ ytchannel, dcchannel, pingrole, guild }) => {
    return new Promise(async (resolve, reject) => {
        const youtubeSettingsApi = new YouTubeSettings(guild.id);

        const channelid = await youtubeSettingsApi.getChannelId(ytchannel);
        if (!channelid) {
            return reject(
                global.t.trans(['error.notifications.youtube.channelNotFound', ytchannel], guild.id)
            );
        }

        if (!guild.members.me) {
            await guild.members.fetch(process.env.DISCORD_APPLICATION_ID);
        }

        let hasChannelPerms = false;
        try {
            hasChannelPerms = hasPermissionsFor(dcchannel, guild.members.me, [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.MentionEveryone,
            ]);
        } catch (err) {
            errorhandler({
                err,
            });
            reject(global.t.trans(['error.notifications.youtube.permissionCheck'], guild.id));
            return false;
        }

        if (!hasChannelPerms) {
            return reject(
                global.t.trans(
                    [
                        'error.permissions.bot.dontKnow',
                        '`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"',
                    ],
                    guild.id
                )
            );
        }

        const allChannelsFromGuild = await youtubeSettingsApi.get(guild.id).catch((err) => {
            reject(err);
            return false;
        });

        const channelExists = allChannelsFromGuild.find(
            (channel) => channel.channel_id === channelid
        );

        if (!allChannelsFromGuild) {
            return;
        }
        if (allChannelsFromGuild.length >= youtubeSettingsApi.MAX_CHANNELS) {
            return reject(
                global.t.trans(
                    ['error.notifications.youtube.maxReached', youtubeSettingsApi.MAX_CHANNELS],
                    guild.id
                )
            );
        }
        if (channelExists) {
            return reject(
                global.t.trans(['error.notifications.youtube.alreadyExists', ytchannel], guild.id)
            );
        }

        const ytUploads = await youtubeSettingsApi.getUploads(channelid);

        youtubeSettingsApi
            .set({
                guild_id: guild.id,
                channel_id: channelid,
                info_channel_id: dcchannel.id,
                pingrole: pingrole ? pingrole.id : null,
                uploads: [ytUploads[0]?.link || ''],
            })
            .then(() => {
                resolve(
                    global.t.trans(['success.notifications.youtube.added', ytchannel], guild.id)
                );
            })
            .catch((err) => {
                errorhandler({
                    err,
                });
                reject(global.t.trans(['error.general'], guild.id));
            });
    });
};

module.exports.delYTChannelFromList = async ({ guild_id, ytchannel }) => {
    return new Promise(async (resolve, reject) => {
        const youtubeSettingsApi = new YouTubeSettings(guild_id);

        const channelid = await youtubeSettingsApi.getChannelId(ytchannel);
        if (!channelid) {
            return reject(
                global.t.trans(['error.notifications.youtube.channelNotFound', ytchannel], guild_id)
            );
        }

        await youtubeSettingsApi
            .remove({ guild_id: guild_id, channel_id: channelid })
            .catch((err) => {
                reject(err);
                return false;
            });

        resolve(global.t.trans(['success.notifications.youtube.removed', ytchannel], guild_id));
    });
};
