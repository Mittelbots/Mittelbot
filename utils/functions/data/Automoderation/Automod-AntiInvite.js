const { Automod } = require('../Automod');

module.exports = class AutomodAntiInvite {
    check(message, bot) {
        return new Promise(async (resolve) => {
            const settings = await Automod.get(message.guild.id);
            const antiInviteSetting = settings?.antiinvite;
            if (!antiInviteSetting?.enabled || !this.isInviteLink(message.content))
                return resolve(false);

            if (
                Automod.checkWhitelist({
                    setting: antiInviteSetting,
                    user_roles: message.member.roles.cache.map((r) => r.id),
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

    isInviteLink(content) {
        const regexWithHttp =
            /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;

        const regexWithoutHttp = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;
        return regexWithHttp.test(content) || regexWithoutHttp.test(content);
    }
};
