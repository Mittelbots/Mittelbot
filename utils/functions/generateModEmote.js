const { getEmote } = require('./getEmote');
const config = require('~assets/json/_config/config.json');

async function generateModEmote({ bot, type }) {
    let emote;

    switch (true) {
        case type == config.defaultModTypes.warn:
            emote = getEmote(bot, config.icons.warn);
            break;
        case type == config.defaultModTypes.kick:
            emote = config.icons.kick;
            break;
        case type == config.defaultModTypes.ban:
            emote = config.icons.ban;
            break;
        case type == config.defaultModTypes.mute:
            emote = config.icons.mute;
            break;
        case type == config.defaultModTypes.unmute:
            emote = config.icons.unmute;
            break;
        case type == config.defaultModTypes.unban:
            emote = config.icons.unban;
            break;
    }
    return type === config.defaultModTypes.warn ? emote : emote + ' ';
}

module.exports = { generateModEmote };
