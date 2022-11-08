<<<<<<< HEAD
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
=======
const {
    getModTime
} = require('../functions/getModTime');
const {
    isMod
} = require('../functions/isMod');
const {
    banUser
} = require('../functions/moderations/banUser');
const {
    scamList,
    publicScamList
} = require('../functions/cache/cache');


async function checkForScam(message, bot, config, log) {
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    const member = await message.guild.members.fetch(message.author)

    if (await isMod({member, guild: message.guild})) return;

<<<<<<< HEAD
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
=======
    const advancedScamList = scamList[0].scamList || [];

    const whitelist_links = advancedScamList.map(link => link.whitelist_link).filter(Boolean)

    const scamLinks = publicScamList[0].scamList || [];


    for (let i in advancedScamList) {
        scamLinks.push(advancedScamList[i].link);
    }

    let messageArray = message.content.split(" ");
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    for (let i in whitelist_links) {
        const isWhitelist = messageArray.some((words) => words.includes(whitelist_links[i]));
        if (isWhitelist) return;
    }



    for (let i in messageArray) {
        if (!messageArray[i]) continue;

<<<<<<< HEAD
        const isInList = scamLinksExt.includes(messageArray[i]);

        if (isInList) {
            const index = scamLinksExt.indexOf(messageArray[i]);
=======
        const isInList = scamLinks.includes(messageArray[i])

        if (isInList) {

            const index = scamLinks.indexOf(messageArray[i]);
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

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
<<<<<<< HEAD
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
=======
                await banUser(await message.guild.members.fetch(message.author), message, `User tried to sent a Scam Link : ${scamLinks[i]}`, bot, config, log, getModTime('99999d'), 'Permanent', true)
                await message.delete().catch(err => {
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
                    return;
                });
                i = 0;
                return true;
            }
        }
    }
<<<<<<< HEAD
};
=======
}

module.exports = {
    checkForScam
}
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
