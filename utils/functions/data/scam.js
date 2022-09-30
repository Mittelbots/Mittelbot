const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const dns = require('dns');
const url = require('url');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const {
    removeHttp
} = require("../removeCharacters");
const config = require('../../../src/assets/json/_config/config.json');
const {
    scamList
} = require("../cache/cache");

module.exports.addScam = ({
    value,
    guild_id,
    guild_name,
    bot,
    author
}) => {
    return new Promise(async (resolve, reject) => {
        if (value.search('http://') !== -1 && value.search('https://') !== -1) {
            value = `http://${value}/`;

        }
        var pass = false;

        const cache = scamList[0].scamList;

        if (cache.length > 0) {

            var approved_links = [];
            var blacklist_servers = [];

            for (let i in cache) {
                for (const key in cache[i]) {
                    if (key === "link") {
                        approved_links.push(cache[i][key]);
                    }
                    if (key === "blacklist") {
                        blacklist_servers.push(cache[i][key]);
                    }
                }
            }

            if (approved_links.includes(removeHttp(value))) {
                return reject('❌ This URL is already in the list and approved!')
            }
            if (blacklist_servers.includes(guild_id)) {
                return reject('❌ Your server is on blacklist! You can\'t sent any requests until the bot moderators removes your server from it.')
            }

            pass = true;
        } else {
            await database.query(`SELECT * FROM advancedScamList`).then(res => {
                if (res.length > 0) {
                    for (let i in res) {
                        if (res[i].blacklist === guild_id) {
                            pass = false;
                            return reject('❌ Your server is on blacklist! You can\'t sent any requests until the bot moderators removes your server from it.')
                        }
                        if (res[i].link === removeHttp(value)) {
                            pass = false;
                            return reject('❌ This URL is already in the list and approved!')
                        }
                        pass = true;
                    }

                } else {
                    return pass = true;
                };
            }).catch(err => {
                reject(`❌ Error while checking something in the database!`);
                return errorhandler({
                    err,
                    fatal: true
                });
            })
        }
        if (!pass) return;
        const parsedLookupUrl = url.parse(value);

        dns.lookup(parsedLookupUrl.protocol ? parsedLookupUrl.host : parsedLookupUrl.path, async (err, address, family) => {
            if (!err) {
                //? URL IS VALID

                value = removeHttp(value);
                return sendScamEmbed({
                        bot,
                        link: value,
                        guild_id,
                        guild_name,
                        author,
                        type: 'ADD'
                    })
                    .then(() => {
                        return resolve(`\`${value}\` Your request was sent to the Bot Moderators. You'll receive an status update in your direkt messages!`)
                    })
                    .catch(err => {
                        return reject(err);
                    })

            } else {
                //! URL IS INVALID
                return reject('❌ Invalid URL!');
            }
        });
    });
}

// ============================================================


module.exports.removeScam = ({
    value,
    guild_id,
    guild_name,
    bot,
    author
}) => {
    return new Promise(async (resolve, reject) => {
        if (value.search('http://') !== -1 && value.search('https://') !== -1) {
            value = `http://${value}/`;
        }

        var exits = false
        var pass = false;
        await database.query(`SELECT * FROM advancedScamList`).then(res => {
            for (let i in res) {
                if (res[i].guild_id === guild_id) {
                    pass = false;
                    return reject('Your server is on blacklist! You can\'t sent any requests until the bot moderators removes your server from it.')
                } else if (res[i].link === removeHttp(value)) {
                    exits = true
                    pass = true;
                    resolve(`\`${value}\` Your request was sent to the Bot Moderators. You'll receive an status update in your direkt messages!`)
                };
            }
        });
        if (!pass) return
        if (!exits) {
            reject('This URL doesn\'t exits in current list!')
            return
        }

        value = removeHttp(value);

        sendScamEmbed({
                bot,
                link: value,
                guild_id,
                guild_name,
                author,
                type: 'DELETE'
            })
            .then(() => {
                resolve(`\`${value}\` Your request was sent to the Bot Moderators. You'll receive an status update in your direkt messages!`)
            })
            .catch(err => {
                reject(err);
            })

    })
}


module.exports.viewScam = ({
    value,
    channel,
    author
}) => {
    return new Promise(async (resolve, reject) => {
        if (!value) {
            database.query(`SELECT * FROM advancedScamList WHERE link != ''`)
                .then(async res => {
                    const backId = 'back'
                    const forwardId = 'forward'
                    const backButton = new ButtonBuilder({
                        style: ButtonStyle.Secondary,
                        label: 'Back',
                        emoji: '⬅️',
                        customId: backId
                    });
                    const forwardButton = new ButtonBuilder({
                        style: ButtonStyle.Secondary,
                        label: 'Forward',
                        emoji: '➡️',
                        customId: forwardId
                    });

                    const embedMessage = new EmbedBuilder()
                        .setTitle('Showing all current blacklist Links')

                    const generateEmbed = async start => {
                        for (i in res) {
                            if (i === (Number(start) + Number(30))) return;
                            embedMessage.addFields([{
                                name: 'LINK:',
                                value: res[i].link
                            }])
                        }
                        return embedMessage;
                    }

                    const canFitOnOnePage = res.length <= 30;
                    const sentMessage = await channel.send({
                        embeds: [await generateEmbed(0)],
                        components: canFitOnOnePage ? [] : [new ActionRowBuilder({
                            components: [forwardButton]
                        })]
                    }).catch(err => {});

                    if (canFitOnOnePage) return;

                    const collector = sentMessage.createMessageComponentCollector({
                        filter: ({
                            user
                        }) => user.id === author.id
                    });

                    let currentIndex = 0;
                    collector.on('collect', async interaction => {
                        interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)

                        await interaction.update({
                            embeds: [await generateEmbed(currentIndex)],
                            components: [
                                new ActionRowBuilder({
                                    components: [
                                        ...(currentIndex ? [backButton] : []),
                                        ...(currentIndex + 10 < data.length ? [forwardButton] : [])
                                    ]
                                })
                            ]
                        });
                    });

                }).catch(err => {
                    return errorhandler({
                        err,
                        fatal: true
                    });
                })
        } else {
            value = removeHttp(value);
            database.query(`SELECT link FROM advancedScamList WHERE link = ?`, [value]).then(res => {
                if (res.length <= 0) {
                    return reject('❌ **No results by searching this URL**');
                }

                return resolve('✅ **Matching link found!**')
            }).catch(err => {
                return errorhandler({
                    err,
                    fatal: true
                });
            })
        }
    });
}

// ============================================================

function sendScamEmbed({
    bot,
    link,
    guild_id,
    guild_name,
    author,
    type
}) {
    return new Promise(async (resolve, reject) => {

        const request_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const accept_label = 'Accept';
        const accept_id = `scamAccept_${request_id}`;

        const deny_label = 'Deny';
        const deny_id = `scamDeny_${request_id}`;

        const blacklist = `scamBlacklist_${request_id}`;
        const blacklistLabel = 'Blacklist Server';

        const newScamLinkembed = new EmbedBuilder()
            .setTitle(`New **${type}** Scam Link request`)
            .addFields([{
                    name: '**LINK:**',
                    value: `\n${removeHttp(link)}`
                },
                {
                    name: '**VIEW SCAN**',
                    value: `https://www.urlvoid.com/scan/${link}/`
                },
                {
                    name: '**SERVER:**',
                    value: `\n${guild_id} (${guild_name})`
                },
            ])
            .setColor((type === 'ADD') ? '#00ff00' : '#ff0000')
            .setTimestamp()

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(accept_id)
                .setLabel(accept_label)
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId(deny_id)
                .setLabel(deny_label)
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId(blacklist)
                .setLabel(blacklistLabel)
                .setStyle(ButtonStyle.Primary)
            )

        let sent_message = await bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.scammanagechannel).send({
            embeds: [newScamLinkembed],
            components: [buttons]
        }).then(async msg => {
            return msg;
        }).catch(err => {
            reject('Error while sending message!');
            return false;
        });

        if (sent_message) {
            sent_message = {
                message: sent_message.id,
                channel: sent_message.channel.id,
            }
            return await database.query(`INSERT INTO advancedScamList (request_link, request_user, request_type, request_guild, request_id, request_message) VALUES (?, ?, ?, ?, ?, ?)`, [link, author.id, type, guild_id, request_id, JSON.stringify(sent_message)])
                .then(res => {
                    const cacheObj = {
                        id: res.insertId,
                        request_link: link,
                        request_user: author.id,
                        request_type: type,
                        request_guild: guild_id,
                        request_id: request_id,
                        request_message: sent_message.id
                    }
                    scamList[0].scamList.push(cacheObj);

                    return resolve(true);
                }).catch(err => {
                    reject('❌ Error while inserting into database! The request was not sent!');
                    return errorhandler({
                        err,
                        fatal: true
                    });
                })
        }
    });
}


module.exports.manageScam = async ({
    main_interaction
}) => {
    return new Promise(async (resolve, reject) => {
        const data = main_interaction.customId.split('_');
        const request_id = data[1];

        var request = scamList[0].scamList.find(x => x.request_id === request_id);

        if (!request) {
            request = await database.query(`SELECT * FROM advancedScamList WHERE request_id = ?`, [request_id]).then(res => {
                return res[0];
            }).catch(err => {
                reject('❌ Error while getting data from the database!');
                return errorhandler({
                    err,
                    fatal: true
                });
            });
        }

        if (!request || !request.length === 0) {
            reject('❌ This request does not exist!');
            main_interaction.update({
                components: []
            }).catch(err => {})
            return;
        }
        const user = main_interaction.bot.guilds.cache.get(request.request_guild).members.cache.get(request.request_user)

        if (main_interaction.customId.search('scamAccept') !== -1) {

            if (request.request_type === 'DELETE') {
                await database.query(`DELETE FROM advancedScamList WHERE link = ?`, [request.request_link])
                    .then(() => {
                        scamList[0].scamList = scamList[0].scamList.filter(x => x.request_link !== request.request_link);
                    })
                    .catch(err => {
                        reject(`❌ Error while deleting the link from the list`);
                        return errorhandler({
                            err,
                            fatal: true
                        });
                    })
            } else {
                await database.query(`INSERT IGNORE INTO advancedScamList (link) VALUES (?); SELECT * FROM advancedScamList WHERE request_link = ?; DELETE FROM advancedScamList WHERE request_link = ?`, [request.request_link, request.request_link,  request.request_link])
                    .then(res => {
                        for(let i in res) {
                            try {
                                if (res[1][i].request_link === request.request_link) {
                                    let message = JSON.parse(res[1][i].request_message);
                                    main_interaction.channel.messages.fetch(message.message).then(msg => {
                                        msg.edit({
                                            content: (request.request_type == 'ADD') ? `✅ This request has been added to the scam list by ${main_interaction.user}` : (request.request_type == 'DELETE') ? `✅ This request has been deleted from the scam list by ${main_interaction.user}` : `✅ This Guild has been added to the blacklist by ${main_interaction.user}`,
                                            components: []
                                        }).catch(err => {})
                                    })
                                    main_interaction.bot.guilds.cache.get(res[1][i].request_guild).members.cache.get(res[1][i].request_user).send({
                                        content: (request.request_type == 'ADD') ? `✅ Your request got accepted.` : (request.request_type == 'DELETE') ? `❌ Your request got declined.` : `❌ Your request got declined.`,
                                    }).catch(err => {})
                                }
                            }catch(err) {}
                        }
                        const cache_allRequests = scamList[0].scamList.filter(x => x.request_link === request.request_link);

                        for(let i in scamList[0].scamList) {
                            if (scamList[0].scamList[i].id === cache_allRequests[0].id) {
                                scamList[0].scamList[i].id = res[0].insertId;
                                scamList[0].scamList[i].link = request.request_link;
                                scamList[0].scamList[i].request_link = null;
                                scamList[0].scamList[i].request_user = null;
                                scamList[0].scamList[i].request_type = null;
                                scamList[0].scamList[i].request_guild = null;
                                scamList[0].scamList[i].request_id = null;
                                scamList[0].scamList[i].request_message = null;
                            }else {
                                delete scamList[0].scamList[i];
                            }
                        }
                        scamList[0].scamList = scamList[0].scamList.filter(Boolean);
                    }).catch(err => {
                        reject(`❌ Error while adding the link to the list`);
                        return errorhandler({
                            err,
                            fatal: true
                        })
                    });
            }
            await user.send(`Your ScamList request was accepted! \n Link: \`${request.request_link}\` `).catch(err => {});
            resolve(true);
        } else if (main_interaction.customId.search('scamDeny') !== -1) {
            await user.send(`Your ScamList request was denied! \n Link: \`${request.request_link}\` `).catch(err => {});
            resolve(true);
        } else {
            await database.query(`INSERT INTO advancedScamList (blacklist) VALUES (?); SELECT * FROM advancedScamList WHERE request_guild = ?; DELETE FROM advancedScamList WHERE request_guild = ?`, [request.request_guild, request.request_guild, request.request_guild])
            .then(res => {
                const cache_allRequests = scamList[0].scamList.filter(x => x.request_guild === request.request_guild);
                
                for(let i in res) {
                    let message = JSON.parse(res[1][i].request_message);
                    main_interaction.channel.messages.fetch(message.message).then(msg => {
                        msg.edit({
                            content: `❌ This Guild has been added to the blacklist by ${main_interaction.user}. The request got canceled!`,
                            components: []
                        }).catch(err => {})
                    })
                }

                for(let i in scamList[0].scamList) {
                    if (scamList[0].scamList[i].id === cache_allRequests[0].id) {
                        scamList[0].scamList[i].id = res[0].insertId;
                        scamList[0].scamList[i].blacklist = request.request_guild;
                        scamList[0].scamList[i].request_link = null;
                        scamList[0].scamList[i].request_user = null;
                        scamList[0].scamList[i].request_type = null;
                        scamList[0].scamList[i].request_guild = null;
                        scamList[0].scamList[i].request_id = null;
                        scamList[0].scamList[i].request_message = null;
                    }else {
                        delete scamList[0].scamList[i];
                    }
                }
                scamList[0].scamList = scamList[0].scamList.filter(Boolean);
            })
            .catch(err => {
                reject(`❌ Error while adding the server to the blacklist`);
                return errorhandler({
                    err,
                    fatal: true
                });
            });
            await user.send(`❌ Your guild got added to the blacklist! Only a bot moderator can remove your guild from the list.`).catch(err => {});
            resolve(true);
        }
    })
}


module.exports.getScamList = async () => {
    return await database.query(`SELECT * FROM advancedScamList`)
        .then(res => {
            return res;
        }).catch(err => {
            return errorhandler({
                err,
                fatal: true
            });
        });
}