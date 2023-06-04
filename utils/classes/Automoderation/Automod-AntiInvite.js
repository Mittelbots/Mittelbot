const Automod = require('../Automod');
const { isValidDiscordInvite } = require('~utils/functions/validate/isValidDiscordInvite');

module.exports = class AutomodAntiInvite {
    check(message, bot) {
        return new Promise(async (resolve) => {
            const antiInviteSetting = await new Automod().get(message.guild.id, 'antiinvite');
            if (!antiInviteSetting?.enabled || !isValidDiscordInvite(message.content)) {
                return resolve(false);
            }

            const isWhitelisted = await new Automod().checkWhitelist({
                setting: antiInviteSetting,
                user_roles: message.member.roles.cache.map((r) => r.id),
                guild_id: message.guild.id,
                message: message,
            });

            if (isWhitelisted) {
                return resolve(false);
            }

            new Automod()
                .punishUser({
                    user: message.author,
                    guild: message.guild,
                    action: antiInviteSetting.action,
                    bot: bot,
                    messages: message,
                    reason: '[ANTI INVITES] Posted an invite link',
                })
                .then(() => {
                    resolve(true);
                });
        });
    }
};
