const { Automod } = require('../Automod');

module.exports = class AutomodAntiInvite {
    constructor(bot) {
        this.bot = bot;
    }

    check(message) {
        return new Promise(async (resolve) => {
            const settings = await Automod.get(message.guild.id);
            const antiInviteSetting = settings.antiinvite;
            if (!antiInviteSetting || antiInviteSetting.length === 0) return false;
            const isWhitelist = Automod.checkWhitelist({
                setting: antiInviteSetting,
                user_roles: message.member.roles.cache.map((r) => r.id),
            });
            if (isWhitelist) return false;
            if (!antiInviteSetting) return false;
            if (!antiInviteSetting.enabled) return false;

            if (!this.isInviteLink(message.content)) return resolve(false);

            Automod.punishUser({
                user: message.author,
                guild: message.guild,
                action: antiInsultsSetting.action,
                bot: this.bot,
                messages: message,
            }).then(() => {
                resolve(true);
            });
        });
    }

    isInviteLink(content) {
        const regex =
            /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;
        return regex.test(content);
    }
};
