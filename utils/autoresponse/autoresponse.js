const config = require('../../src/assets/json/_config/config.json');
const autoresponseconfig = require('../../autoresponse.json');

function autoresponse(message) {
    var letUserPass = true;
    var forceUserPass = false;
    for(let i in autoresponseconfig.whitelist)
    if(message.member.roles.cache.find(r => r.id === autoresponseconfig.whitelist[i])) {
        letUserPass = true;
        forceUserPass = true;
    }
    if(!forceUserPass) {
        for(let i in autoresponseconfig) {
            if(!letUserPass) continue;
            if(i !== 'whitelist' && message.content.search(i) !== -1) {
                message.delete();
                message.channel.send(`<@${message.author.id}> ${autoresponseconfig[i]}`)
                letUserPass = false;
            }
        }
    }
    return letUserPass;
}

module.exports = {autoresponse}