function checkMessage({author_id, target, bot, type}) {
    if (target.id === author.id) return `You can't ${type} yourself.`;
    if (target.id === bot.user.id) return `You cant't ${type} me.`;
    if (member.bot) return `You can't ${type} a bot!`;
}

module.exports = {checkMessage}