const config = require('../../config.json');
const blacklistfile = require('../../blacklist.json');

/**
 * 
 * @param {int} type 0 = command; 1 = normal
 * @param {Object} message 
 */
function blacklist(type, message) {
    var letUserPass = true;
    if(type == 0) {
        for (let i in blacklistfile) {
            if(!letUserPass) continue;
            for (key in blacklistfile[i]) {
                if(!letUserPass) continue;
                if(blacklistfile[i][key].indexOf(message.channelId) !== -1) {
                    message.delete();
                    message.channel.send(`<@${message.author.id}> You can't use this here!`).then(msg => setTimeout(() => msg.delete() ,5000));
                    letUserPass = false;
                    continue;
                }
            }
        }
    }else {

    }
    return letUserPass;
}

module.exports = {blacklist};