const {
    channelId
} = require('@gonetone/get-youtube-id-by-url');
const database = require('../../../src/db/db');
const {
    ytUploads
} = require('../cache/cache');
const {
    errorhandler
} = require('../errorhandler/errorhandler');
const request = new(require("rss-parser"))();

module.exports.changeYtNotifier = async ({
    ytchannel,
    dcchannel,
    pingrole,
    guild
}) => {
    return new Promise(async (resolve, reject) => {

        const url = new URL(ytchannel);

        try {

        if(!url.hostname.startsWith('www.')) {
            ytchannel = `https://www.${url.hostname}${url.pathname}`;
        }


        const channelid = await channelId(ytchannel)
            .then(id => {
                return id;
            })
            .catch(err => {
                console.log(err);
                reject(`❌ I couldn't find the channel you have entered.`)
                return false;
            })
        if (!channelid) return;
            await guild.members.fetch();
        const hasChannelPerms = guild.members.me.permissionsIn(dcchannel.id).has(["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"]);

        if (!hasChannelPerms) {
            return reject(`❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"\`. Change them and try again.`)
        }


        var allChannelsFromGuild = await database.query(`SELECT * FROM guild_uploads WHERE guild_id = ?`, [guild.id])
            .then(res => {
                return {
                    error: false,
                    data: res
                }
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                })
                reject(`❌ Something went wrong while selecting all youtube channels. Please contact the Bot support.`)
                return {
                    error: true
                };
            })
        if (allChannelsFromGuild.error) return;

        allChannelsFromGuild = allChannelsFromGuild.data;

        const ytChannelExists = allChannelsFromGuild.filter(channel => channel.channel_id === channelid)[0];

        if (allChannelsFromGuild) {
            if (allChannelsFromGuild.length >= 3 && !ytChannelExists) {
                return reject(`You already have 3 youtube channels. You have to delete one first.`)
            }
        }

        if (ytChannelExists) {
            if (channelid === ytChannelExists.channel_id && dcchannel.id === ytChannelExists.info_channel_id && pingrole === ytChannelExists.pingrole) {
                reject(`❌ You are trying to add the same config you've already added.`)
                return;
            }

            database.query(`UPDATE guild_uploads SET info_channel_id = ?, pingrole = ? WHERE guild_id = ? AND channel_id = ?`, [dcchannel.id, (pingrole) ? pingrole.id : null, guild.id, channelid])
                .then(() => {
                    let cache = ytUploads[0].list;
                    for (let i in cache) {
                        if (cache[i].guild_id === guild.id && cache[i].channel_id === channelid) {
                            cache[i].info_channel_id = dcchannel.id;
                            cache[i].pingrole = (pingrole) ? pingrole.id : null;
                            break;
                        }
                    }
                    resolve('✅ Successfully updated the youtube channel settings.')
                })
                .catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    reject('❌ Something went wrong while updating the data. Please contact the Bot support.')
                })
        } else {

            request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelid}`)
                .then(async (feed) => {
                    const latestVideo = JSON.stringify([feed.items[0].link]);

                    database.query(`INSERT INTO guild_uploads (guild_id, channel_id, info_channel_id, pingrole, uploads) VALUES (?, ?, ?, ?, ?)`, [guild.id, channelid, dcchannel.id, (pingrole) ? pingrole.id : null, latestVideo])
                        .then((res) => {

                            let cache = ytUploads[0].list;
                            
                            cache.push({
                                guild_id: guild.id,
                                channel_id: channelid,
                                info_channel_id: dcchannel.id,
                                pingrole: (pingrole) ? pingrole.id : null,
                                uploads: latestVideo
                            });

                            resolve('✅ Successfully added the youtube channel to the notification list.')
                        })
                        .catch(err => {
                            errorhandler({
                                err,
                                fatal: true
                            });
                            reject('❌ Something went wrong while adding the channel to the database. Please contact the Bot support.')
                        })
                })
                .catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    reject('❌ Something went wrong while fetching the youtube data. Please contact the Bot support or try again later.')
                })


        }
    }catch(err) {
        console.log(err)
    }
    })
}

module.exports.delChannelFromList = async ({
    guild_id,
    delytchannel
}) => {
    return new Promise(async (resolve, reject) => {
        const channelid = await channelId(delytchannel)
            .then(id => {
                return id;
            })
            .catch(err => {
                reject(`I couldn't find the channel you have entered.`)
                return false;
            })
        if (!channelid) return;

        database.query(`DELETE FROM guild_uploads WHERE guild_id = ? AND channel_id = ?`, [guild_id, channelid])
            .then(() => {
                let cache = ytUploads[0].list;
                for (let i in cache) {
                    if (cache[i].guild_id === guild_id && cache[i].channel_id === channelid) {
                        delete cache[i];
                        break;
                    }
                }
                ytUploads[0].list = cache.filter(Boolean);

                resolve('✅ Successfully removed the youtube channel to the notification list.')
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                });
                reject('❌ Something went wrong while removing the channel from the database. Please contact the Bot support.')
            })
    })
}