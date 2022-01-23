const axios = require('axios');
const { getModTime } = require('../functions/getModTime');
const { banUser } = require('../functions/moderations/banUser');

async function checkForScam(message, database, bot, config, log) {

    if(message.content.search('http') === -1) return

    axios.get('https://raw.githubusercontent.com/nikolaischunk/discord-phishing-links/main/domain-list.json').then(async res => {
        let data = res.data.domains;
        for(let i in data) {
            if(data[i].search(message.content)) {
                await banUser(database, await message.guild.members.fetch(message.author), message, `User tried to sent a Scam Link : ${data[i]}`, bot, config, log, getModTime('99999d'), 'Permanent', true)
                await message.delete();
                i = 0;
                return;
            }
        }
    })
}

module.exports = {checkForScam}