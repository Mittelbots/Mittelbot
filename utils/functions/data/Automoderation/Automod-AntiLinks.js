const { Automod } = require('../Automod');

module.exports = class AutomodAntiLinks {
    check(message, bot) {
        return new Promise(async (resolve) => {
            const settings = await Automod.get(message.guild.id);
            const antiLinksSetting = settings?.antilinks;
            if (!antiLinksSetting?.enabled || !this.isLink(message.content)) return resolve(false);

            if (
                Automod.checkWhitelist({
                    setting: antiLinksSetting,
                    user_roles: message.member.roles.cache.map((r) => r.id),
                })
            ) {
                return resolve(false);
            }
            Automod.punishUser({
                user: message.author,
                guild: message.guild,
                action: antiLinksSetting.action,
                bot: bot,
                messages: message,
            }).then(() => {
                resolve(true);
            });
        });
    }

    isLink(content) {
        const regex = /(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?/gi;
        return regex.test(content);
    }
};
