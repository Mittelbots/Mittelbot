const { isValidDiscordInvite } = require('../../validate/isValidDiscordInvite');
const { Automod } = require('../Automod');

module.exports = class AutomodAntiInvite {
    check(message, bot) {
        return new Promise(async (resolve) => {
            const antiInviteSetting = await Automod.get(message.guild.id, 'antiinvite');
            if (!antiInviteSetting?.enabled || !isValidDiscordInvite(message.content))
                return resolve(false);
            if (
                await Automod.checkWhitelist({
                    setting: antiInviteSetting,
                    user_roles: message.member.roles.cache.map((r) => r.id),
                    message: message,
                    guild_id: message.guild.id,
                })
            ) {
                return resolve(false);
            }
            Automod.punishUser({
                user: message.author,
                guild: message.guild,
                action: antiInviteSetting.action,
                bot: bot,
                messages: message,
            }).then(() => {
                resolve(true);
            });
        });
    }
};
