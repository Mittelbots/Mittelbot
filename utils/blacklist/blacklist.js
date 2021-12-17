const config = require('../../config.json');
const blacklistfile = require('../../blacklist.json');

/**
 * 
 * @param {int} type 0 = command; 1 = normal
 * @param {Object} message 
 */
function blacklist(type, message) {
    var letUserPass = true;
    if (type == 0) {
        for (key in blacklistfile.channels) {
            if (!letUserPass) continue;
            if (blacklistfile.channels[key].indexOf(message.channelId) !== -1) {
                message.delete();
                message.channel.send(`<@${message.author.id}> You can't use this here!`).then(msg => setTimeout(() => msg.delete(), 5000));
                letUserPass = false;
                continue;
            }
        }
    } else {
        for(key in blacklistfile.words) {
            if (!letUserPass) continue;
            for(key2 in blacklistfile.words[key]) {
                if (!letUserPass) continue;
                if(key === 'wildcard' && blacklistfile.words[key].indexOf(message.content) !== -1 || key === 'exact' && message.content == blacklistfile.words[key]) {
                    message.delete();
                    message.channel.send('shhhh. Dont say that!');
                    letUserPass = false;
                }
            }
        }
    }
    return letUserPass;
}

module.exports = {
    blacklist
};