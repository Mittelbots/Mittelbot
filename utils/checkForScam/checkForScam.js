const axios = require('axios');
const { getModTime } = require('../functions/getModTime');
const { isMod } = require('../functions/isMod');
const { banUser } = require('../functions/moderations/banUser');
const { errorhandler } = require('../functions/errorhandler/errorhandler');
const database = require('../../src/db/db');


async function checkForScam(message, bot, config, log) {

    if(await isMod(await message.guild.members.fetch(message.author), message)) return;

    const advancedScamList = await database.query('SELECT link, whitelist_link FROM advancedScamList')
    .catch(err => {
        errorhandler({err, fatal: true});
        return message.delete().catch(err => {});
    });

    const whitelist_links = advancedScamList.map(link => link.whitelist_link).filter(Boolean)

    axios.get('https://discord-phishing-backend.herokuapp.com/all').then(async res => {
        let data = res.data;
        
        for(let i in advancedScamList) {
            data.push(advancedScamList[i].link);
        }


		let messageArray = message.content.split(" ");

        for(let i in whitelist_links) {
        	const isWhitelist = messageArray.some((words) => words.includes(whitelist_links[i]));
			if(isWhitelist) return;
        }

		
        for(let i in data) {
				const isScam = messageArray.some((words) => words.includes(data[i]));
            if(isScam) {
                await banUser(await message.guild.members.fetch(message.author), message, `User tried to sent a Scam Link : ${data[i]}`, bot, config, log, getModTime('99999d'), 'Permanent', true)
                await message.delete().catch(err => {return;});
                i = 0;
                return;
            }
        }
		
    })
    .catch(err => {
        return errorhandler({err, fatal: true});
        return message.delete().catch(err => {return;});
    })
}

module.exports = {checkForScam}