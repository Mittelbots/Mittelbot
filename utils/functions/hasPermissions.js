function hasPermission(message, adminOnly, modOnly) {
    const config = require('../../config.json');
    let hasPermission = false
    for (let i in config.modroles) {
        if(adminOnly && message.member.roles.cache.find(r => r.id === config.modroles.trialmoderator || r.id === config.modroles.moderator)) continue;
        if(modOnly && message.member.roles.cache.find(r => r.id === config.modroles.trialmoderator)) {continue};
        
        if (message.member.roles.cache.find(r => r.id === config.modroles[i]) !== undefined) {
            hasPermission = true;
            break;
        }
    }
    return hasPermission;
}

module.exports = {hasPermission}