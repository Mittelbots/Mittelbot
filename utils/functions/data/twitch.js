const { PermissionFlagsBits } = require('discord.js');
const { twitchApiClient } = require('../../../src/events/notfifier/twitch_notifier');
const { errorhandler } = require('../errorhandler/errorhandler');
const twitchStreams = require('../../../src/db/Models/tables/twitchStreams.model');

module.exports.changeTwitchNotifier = async ({ twitchchannel, twdcchannel, twpingrole, guild }) => {
    return new Promise(async (resolve, reject) => {
        try {
            var twitch_user = await twitchApiClient.users.getUserByName(twitchchannel);
        } catch (err) {
            return reject(`❌ I couldn't find the channel you have entered.`);
        }
        if (!twitch_user) {
            return reject(`❌ I couldn't find the channel you have entered.`);
        }

        if (!guild.members.me) {
            await guild.members.fetch(process.env.DISCORD_APPLICATION_ID);
        }
        try {
            var hasChannelPerms = twdcchannel
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
            reject(
                `❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"\`. Change them and try again.`
            );
            return;
        }

        const allChannelsFromGuild = await twitchStreams
            .findAll({
                where: {
                    guild_id: guild.id,
                },
            })
            .then((res) => {
                return res;
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                reject(
                    `❌ Something went wrong while selecting all youtube channels. Please contact the Bot support.`
                );
                return false;
            });

        if (!allChannelsFromGuild) return;

        let twChannelExists;
        if (allChannelsFromGuild.length > 0) {
            twChannelExists = allChannelsFromGuild.filter(
                (channel) => channel.channel_id === twitch_user.id
            )[0];

            if (allChannelsFromGuild.length >= 3 && !twChannelExists) {
                return reject(`You already have 3 twitch channels. You have to delete one first.`);
            }
        }

        if (twChannelExists) {
            if (
                twitch_user.id === twChannelExists.channel_id &&
                twdcchannel.id === twChannelExists.info_channel_id &&
                twpingrole === twChannelExists.pingrole
            ) {
                reject(`❌ You are trying to add the same config you've already added.`);
                return;
            }

            twitchStreams
                .update(
                    {
                        info_channel_id: twdcchannel.id,
                        pingrole: twpingrole ? twpingrole.id : null,
                    },
                    {
                        where: {
                            guild_id: guild.id,
                            channel_id: twitch_user.id,
                        },
                    }
                )
                .then(() => {
                    resolve(
                        `✅ Successfully updated the twitch channel settings for ${twChannelExists.channel_name}.`
                    );
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                    reject(
                        '❌ Something went wrong while updating the data. Please contact the Bot support.'
                    );
                });
        } else {
            twitchStreams
                .create({
                    guild_id: guild.id,
                    channel_id: twitch_user.id,
                    info_channel_id: twdcchannel.id,
                    pingrole: twpingrole ? twpingrole.id : null,
                    channel_name: twitchchannel,
                })
                .then(() => {
                    resolve(`✅ Successfully added ${twitchchannel} to the notification list.`);
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
        }
    });
};

module.exports.delTwChannelFromList = async ({ guild_id, deltwchannel }) => {
    return new Promise(async (resolve, reject) => {
        const twitch_user = await twitchApiClient.users.getUserByName(deltwchannel);
        if (!twitch_user) {
            return reject(`❌ I couldn't find the channel you have entered.`);
        }

        twitchStreams
            .destroy({
                where: {
                    guild_id,
                    channel_id: twitch_user.id,
                },
            })
            .then(() => {
                resolve('✅ Successfully removed the twitch channel to the notification list.');
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                reject(
                    '❌ Something went wrong while removing the channel from the database. Please contact the Bot support.'
                );
            });
    });
};
