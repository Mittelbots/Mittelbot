const advancedScamList = require('~src/db/Models/advancedScamList.model');
const { getModTime } = require('../getModTime');
const { isMod } = require('../isMod');
const { banUser } = require('../moderations/banUser');
const fs = require('fs');
const { errorhandler } = require('../errorhandler/errorhandler');
const { messageDeleteReasons } = require('~assets/js/messageDeleteReasons');

let publicScamList = [];

module.exports = class ScamDetection {
    constructor() {}

    loadScam() {
        return new Promise(async (resolve, reject) => {
            try {
                const links = fs.readFileSync('./src/assets/json/scamLinks.json', 'utf8');
                publicScamList = JSON.parse(links);
                resolve();
            } catch (err) {
                errorhandler({ err });
                reject();
            }
        });
    }

    check(message, bot) {
        return new Promise(async (resolve) => {
            const member = await message.guild.members.fetch(message.author);

            if (await isMod({ member, guild: message.guild })) return resolve(false);

            const scamListDB = await advancedScamList
                .findAll()
                .then((res) => {
                    return res;
                })
                .catch(() => {
                    return [];
                });
            const scamLinksExt = publicScamList;

            const whitelist_links = [];

            for (let i in scamListDB) {
                if (scamListDB[i].whitelist) {
                    whitelist_links.push(scamListDB[i].link);
                } else {
                    scamLinksExt.push(scamListDB[i].link);
                }
            }

            const messageArray = message.content.split(' ');

            for (let i in whitelist_links) {
                const isWhitelist = messageArray.some((words) =>
                    words.includes(whitelist_links[i])
                );
                if (isWhitelist) return resolve(false);
            }

            for (let i in messageArray) {
                if (!messageArray[i]) continue;

                const isInList = scamLinksExt.includes(messageArray[i]);
                if (isInList) {
                    const index = scamLinksExt.indexOf(messageArray[i]);

                    let match = 0;

                    if (index) {
                        for (let m = 0; m <= messageArray[i].length; m++) {
                            if (messageArray[i][m] == scamLinksExt[index][m]) {
                                match++;
                            }
                        }
                    }

                    if (match <= JSON.stringify(messageArray[i]).length) {
                        match = (match * 100) / messageArray[i].length;
                    } else {
                        match = 100;
                    }

                    if (match >= 94) {
                        const reason = `User tried to sent a Scam Link : ${scamLinksExt[index]}`;

                        await banUser({
                            user: await message.guild.members.fetch(message.author),
                            mod: bot.user,
                            guild: message.guild,
                            reason: reason,
                            bot,
                            dbtime: getModTime('99999d'),
                            time: 'Permanent',
                            isAuto: true,
                        });
                        errorhandler({
                            err: `${reason}, Users Input: ${messageArray[i]}`,
                        });
                        messageDeleteReasons.set(message.id, reason);
                        await message.delete().catch(() => {});
                        i = 0;
                        return resolve(true);
                    }
                }
                return resolve(false);
            }

            return resolve(false);
        });
    }
};
