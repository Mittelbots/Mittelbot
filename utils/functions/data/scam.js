const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const dns = require('dns');
const url = require('url');
const {
    MessageEmbed,
    MessageActionRow
} = require("discord.js");
const {
    removeHttp
} = require("../removeCharacters");
const {
    MessageButton
} = require("discord.js");
const config = require('../../../src/assets/json/_config/config.json');

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
        await database.query(`SELECT * FROM advancedScamList`).then(res => {
            if (res.length > 0) {
                for (let i in res) {
                    if (res[i].guild_id === guild_id) {
                        pass = false;
                        return reject('Your server is on blacklist! You can\'t send any requests until the bot moderators removes your server from it.')
                    }
                    if (res[i].link === removeHttp(value)) {
                        pass = false;
                        return reject(`This URL already exits in current Scamlist`)
                    }
                    pass = true;
                }

            } else {
                return pass = true;
            };
        }).catch(err => {
            reject(`Error while checking something in the database!`);
            return errorhandler({
                err,
                fatal: true
            });
        })

        if (!pass) return

        const parsedLookupUrl = url.parse(value);

        dns.lookup(parsedLookupUrl.protocol ? parsedLookupUrl.host : parsedLookupUrl.path, async (err, address, family) => {
            if (!err) {
                //? URL IS VALID

                value = removeHttp(value);

                sendScamEmbed({
                    bot,
                    link: value,
                    guild_id,
                    guild_name,
                    author,
                    type: 'ADD'
                }).catch(err => {
                    reject(err);
                })

            } else {
                //! URL IS INVALID
                reject('Invalid URL!');
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
                    resolve(`\`**${value}**\` Your request was sent to the Bot Moderators. You'll receive an status update in your direkt messages!`)
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
        }).catch(err => {
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
                    const backButton = new MessageButton({
                        style: 'SECONDARY',
                        label: 'Back',
                        emoji: '⬅️',
                        customId: backId
                    });
                    const forwardButton = new MessageButton({
                        style: 'SECONDARY',
                        label: 'Forward',
                        emoji: '➡️',
                        customId: forwardId
                    });

                    const embedMessage = new MessageEmbed()
                        .setTitle('Showing all current blacklist Links')

                    const generateEmbed = async start => {
                        for (i in res) {
                            if (i === (Number(start) + Number(30))) return;
                            embedMessage.addField('LINK:', res[i].link)
                        }
                        return embedMessage;
                    }

                    const canFitOnOnePage = res.length <= 30;
                    const sentMessage = await channel.send({
                        embeds: [await generateEmbed(0)],
                        components: canFitOnOnePage ? [] : [new MessageActionRow({
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
                                new MessageActionRow({
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
        const accept = 'accept';
        const deny = 'deny';

        const blacklist = 'blacklist';
        const blacklistLabel = 'Blacklist Server';

        const newScamLinkembed = new MessageEmbed()
            .setTitle(`New **${type}** Scam Link request`)
            .addField('**LINK:**', `\n${removeHttp(link)}`)
            .addField('**VIEW SCAN**', `https://www.urlvoid.com/scan/${link}/`)
            .addField('**SERVER:**', `\n${guild_id} (${guild_name})`)
            .setTimestamp()

        const buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId(accept)
                .setLabel(accept)
                .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                .setCustomId(deny)
                .setLabel(deny)
                .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                .setCustomId(blacklist)
                .setLabel(blacklistLabel)
                .setStyle('DANGER')
            )

        const sentMessage = await bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.scammanagechannel).send({
            embeds: [newScamLinkembed],
            components: [buttons]
        }).catch(err => {});

        const collector = sentMessage.createMessageComponentCollector({
            max: 1
        });

        collector.on('collect', async interaction => {
            await interaction.deferUpdate();
            if (interaction.customId === accept) {
                if (type === 'DELETE') {
                    database.query(`DELETE FROM advancedScamList WHERE link = ?`, [removeHttp(link)])
                        .catch(err => {
                            reject(`Error while deleting the link from the list`);
                            return errorhandler({
                                err,
                                fatal: true
                            });
                        })
                } else {
                    database.query(`INSERT INTO advancedScamList (link) VALUES (?)`, [removeHttp(link)])
                        .catch(err => {
                            reject(`Error while adding the link to the list`);
                            return errorhandler({
                                err,
                                fatal: true
                            })
                        });
                }
                return await author.send(`Your ScamList request was accepted! \n Link: \`${link}\` `).catch(err => {});
            } else if (interaction.customId === deny) {
                return await author.send(`Your ScamList request was denied! \n Link: \`${link}\` `).catch(err => {});
            } else {
                database.query(`INSERT INTO advancedScamList (guild_id) VALUES (?)`, [guild_id]).catch(err => {
                    reject(`Error while adding the server to the blacklist`);
                    return errorhandler({
                        err,
                        fatal: true
                    });
                });
                return await author.send(`Your Server got added to the blacklist!`).catch(err => {});
            }
        });

        collector.on('end', (collected, reason) => {
            collected.forEach(x => {
                for (let i in buttons.components) {
                    if (buttons.components[i].customId === x.customId) {
                        buttons.components[i].setStyle('SUCCESS');
                    }
                    buttons.components[i].setDisabled(true)
                }
                sentMessage.edit({
                    embeds: [newScamLinkembed],
                    components: [buttons]
                }).catch(err => {});
            });

        });
    });
}