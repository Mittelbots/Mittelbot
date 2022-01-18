function checkMessage(message, member, bot, type) {
    if (member.id === message.author.id) return `You can't ${type} yourself.`;
    if (member.id === bot.user.id) return `You cant't ${type} me.`;
    if (member.user.bot) return `You can't ${type} a bot!`;
}

module.exports = {checkMessage}