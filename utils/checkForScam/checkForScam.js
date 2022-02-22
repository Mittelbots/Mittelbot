const axios = require('axios');
const { getModTime } = require('../functions/getModTime');
const { isMod } = require('../functions/isMod');
const { banUser } = require('../functions/moderations/banUser');

async function checkForScam(message, bot, config, log) {

    // if(message.content.search('http') === -1) return

    if(await isMod(await message.guild.members.fetch(message.author), message)) return;

    axios.get('https://raw.githubusercontent.com/nikolaischunk/discord-phishing-links/main/domain-list.json').then(async res => {
        let data = res.data.domains;
        
        if(message.content.search('discord.gg') !== -1 && message.content.indexOf('discord.gg') !== -1){
            return;
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
}

module.exports = {checkForScam}