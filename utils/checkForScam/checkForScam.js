const advancedScamList = require('../../src/db/Models/tables/advancedScamList.model');
const { getModTime } = require('../functions/getModTime');
const { isMod } = require('../functions/isMod');
const { banUser } = require('../functions/moderations/banUser');
const axios = require('axios');

let publicScamList = [];

module.exports.loadScam = async () => {
    await axios
        .get('https://discord-phishing-backend.herokuapp.com/all')
        .then((res) => {
            console.log(`[SCAM] Loaded ${res.data.length} Scam Links`);
            publicScamList = res.data;
        })
        .catch((err) => {
            return;
        });
};

module.exports.checkForScam = async (message, bot, config, log) => {
    const member = await message.guild.members.fetch(message.author);

    if (await isMod({ member, guild: message.guild })) return;

    const scamListDB = advancedScamList
        .findAll()
        .then((res) => {
            return res;
        })
        .catch((err) => {
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
        const isWhitelist = messageArray.some((words) => words.includes(whitelist_links[i]));
        if (isWhitelist) return;
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

            if (match >= 70) {
                await banUser(
                    await message.guild.members.fetch(message.author),
                    message,
                    `User tried to sent a Scam Link : ${scamLinksExt[i]}`,
                    bot,
                    config,
                    log,
                    getModTime('99999d'),
                    'Permanent',
                    true
                );
                await message.delete().catch((err) => {
                    return;
                });
                i = 0;
                return true;
            }
        }
    }
};
