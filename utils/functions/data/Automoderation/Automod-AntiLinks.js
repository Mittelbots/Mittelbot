const { Automod } = require('../Automod');

module.exports = class AutomodAntiLinks {
    check(message, bot) {
        return new Promise(async (resolve) => {
            const settings = await Automod.get(message.guild.id, 'antilinks');
            if (!settings?.enabled || !this.isLink(message.content)) return resolve(false);

            if (
                await Automod.checkWhitelist({
                    setting: settings,
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
                action: settings.action,
                bot: bot,
                messages: message,
            }).then(() => {
                resolve(true);
            });
        });
    }

    isLink(content) {
        const regex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i;
        return regex.test(content);
    }
};
