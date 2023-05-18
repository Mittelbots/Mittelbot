const { PermissionFlagsBits } = require('discord.js');
const guildUploads = require('../../../src/db/Models/tables/guildUploads.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const YouTubeSettings = require('./Notifications/YouTube/YouTubeSettings');
const { hasPermissionsFor } = require('../../permissions/permissions');

module.exports.changeYtNotifier = async ({ ytchannel, dcchannel, pingrole, guild }) => {
    return new Promise(async (resolve, reject) => {
        const youtubeSettingsApi = new YouTubeSettings(guild.id);

        const channelid = await youtubeSettingsApi.getChannelId(ytchannel);
        if (!channelid) {
            return reject(`❌ I couldn't find a channel with the name \`${ytchannel}\`.`);
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
            reject(`❌ Something went wrong while checking the permissions. Please try again.`);
            return false;
        }

        if (!hasChannelPerms) {
            return reject(
                `❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"\`. Change them and try again.`
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
        } else if (allChannelsFromGuild.length >= youtubeSettingsApi.MAX_CHANNELS) {
            return reject(
                `❌ You can only add ${youtubeSettingsApi.MAX_CHANNELS} channels to the list.`
            );
        } else if (channelExists) {
            return reject(`This channel is already in the list. Please remove it first.`);
        }

        const ytUploads = await youtubeSettingsApi.getUploads(channelid).catch((err) => {
            reject(err);
            return false;
        });
        if (!ytUploads) {
            return;
        }

        youtubeSettingsApi
            .set({
                guild_id: guild.id,
                channel_id: channelid,
                info_channel_id: dcchannel.id,
                pingrole: pingrole ? pingrole.id : null,
                uploads: [ytUploads[0].link],
            })
            .then(() => {
                resolve('✅ Successfully added the youtube channel to the notification list.');
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
    });
};

module.exports.delYTChannelFromList = async ({ guild_id, ytchannel }) => {
    return new Promise(async (resolve, reject) => {
        const youtubeSettingsApi = new YouTubeSettings(guild_id);

        const channelid = await youtubeSettingsApi.getChannelId(ytchannel);
        if (!channelid) {
            return reject(`❌ I couldn't find a channel with the name \`${ytchannel}\`.`);
        }

        await youtubeSettingsApi
            .remove({ guild_id: guild_id, channel_id: channelid })
            .catch((err) => {
                reject(err);
                return false;
            });

        resolve('✅ Successfully removed the youtube channel from the notification list.');
    });
};
