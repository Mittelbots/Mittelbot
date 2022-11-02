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

    const member = await message.guild.members.fetch(message.author)

    if (await isMod({member, guild: message.guild})) return;

    const advancedScamList = scamList[0].scamList || [];

    const whitelist_links = advancedScamList.map(link => link.whitelist_link).filter(Boolean)

    const scamLinks = publicScamList[0].scamList || [];


    for (let i in advancedScamList) {
        scamLinks.push(advancedScamList[i].link);
    }

    let messageArray = message.content.split(" ");

    for (let i in whitelist_links) {
        const isWhitelist = messageArray.some((words) => words.includes(whitelist_links[i]));
        if (isWhitelist) return;
    }



    for (let i in messageArray) {
        if (!messageArray[i]) continue;

        const isInList = scamLinks.includes(messageArray[i])

        if (isInList) {

            const index = scamLinks.indexOf(messageArray[i]);

            let match = 0;

            if (index) {
                for (let m = 0; m <= messageArray[i].length; m++) {
                    if (messageArray[i][m] == scamLinks[index][m]) {
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
                await banUser(await message.guild.members.fetch(message.author), message, `User tried to sent a Scam Link : ${scamLinks[i]}`, bot, config, log, getModTime('99999d'), 'Permanent', true)
                await message.delete().catch(err => {
                    return;
                });
                i = 0;
                return;
            }
        }
    }
}

module.exports = {
    checkForScam
}