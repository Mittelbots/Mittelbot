const axios = require("axios")
const { errorhandler } = require("../functions/errorhandler/errorhandler");
const { banUser } = require("../functions/moderations/banUser");

async function checkForScam(message, log, config, database) {
    axios.get('https://raw.githubusercontent.com/Angry-Pineapple3121/Malware-Research/main/scam-links.json').then(async res => {
        if(await res.data.indexOf(message.content) !== -1) {
            await banUser(database, message.author, message, 'Trying to sent a scam Link', bot, config, log, getModTime('99999d'), 'Permanent')
            message.delete();
        }
    }).catch(err => {
        errorhandler(err, 'GITHUB ERROR', null, log, config)
    })
}

module.exports = {checkForScam}