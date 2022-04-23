const axios = require('axios');
const { getModTime } = require('../functions/getModTime');
const { isMod } = require('../functions/isMod');
const { banUser } = require('../functions/moderations/banUser');
const { errohandler } = require('../functions/errorhandler/errorhandler');
const database = require('../../src/db/db');


async function checkForScam(message, bot, config, log) {

    //if(await isMod(await message.guild.members.fetch(message.author), message)) return;

    const advancedScamList = await database.query('SELECT link, whitelist_link FROM advancedScamList')
    .catch(err => {
        errohandler(err, 'Error while fetching Community Scam List database', message.channel, log, config, true)
        return message.delete().catch(err => {return;});
    });

    const whitelist_links = advancedScamList.map(link => link.whitelist_link).filter(Boolean)

    axios.get('https://discord-phishing-backend.herokuapp.com/all').then(async res => {
        let data = res.data;
        
        for(let i in advancedScamList) {
            data.push(advancedScamList[i].link);
        }

        for(let i in whitelist_links) {
            if(message.content.search(whitelist_links[i]) !== -1 && message.content.indexOf(whitelist_links[i]) !== -1){
                return;
            }
        }

        for(let i in data) {
            if(message.content.search(data[i]) !== -1 && message.content.indexOf(data[i]) !== -1) {
                await banUser(await message.guild.members.fetch(message.author), message, `User tried to sent a Scam Link : ${data[i]}`, bot, config, log, getModTime('99999d'), 'Permanent', true)
                await message.delete().catch(err => {return;});
                i = 0;
                return;
            }
        }
    })
    .catch(err => {
        errohandler(err, 'Error while fetching Scam List', message.channel, log, config, true)
        return message.delete().catch(err => {return;});
    })
}

module.exports = {checkForScam}