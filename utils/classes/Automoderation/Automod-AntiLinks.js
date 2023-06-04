const Automod = require('../Automod');
const { isValidDiscordInvite } = require('~utils/functions/validate/isValidDiscordInvite');
const { isValidLink } = require('~utils/functions/validate/isValidLink');

module.exports = class AutomodAntiLinks {
    check(message, bot) {
        return new Promise(async (resolve) => {
            const settings = await new Automod().get(message.guild.id, 'antilinks');
            if (
                !settings?.enabled ||
                !isValidLink(message.content) ||
                isValidDiscordInvite(message.content)
            )
                return resolve(false);

            if (
                await new Automod().checkWhitelist({
                    setting: settings,
                    user_roles: message.member.roles.cache.map((r) => r.id),
                    message: message,
                    guild_id: message.guild.id,
                })
            ) {
                return resolve(false);
            }
            new Automod()
                .punishUser({
                    user: message.author,
                    guild: message.guild,
                    action: settings.action,
                    bot: bot,
                    messages: message,
                    reason: '[ANTI LINKS] Posted a link',
                })
                .then(() => {
                    resolve(true);
                });
        });
    }
};
