const { getEmote } = require("./getEmote");

async function generateModEmote(config, bot, type) {
    let emote;

    switch(true) {
        case type == config.defaultModTypes.warn:
            emote = config.icons.warn
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
    return getEmote(bot, emote);
}

module.exports = {generateModEmote};