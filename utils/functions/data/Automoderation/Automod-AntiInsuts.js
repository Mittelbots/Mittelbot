const { Automod } = require('../Automod');

module.exports = class AutomodAntiInsults {
    constructor() {}

    check(message, bot) {
        return new Promise(async (resolve) => {
            const antiInsultsSetting = await Automod.get(message.guild.id, 'antiinsults');

            if (
                !antiInsultsSetting ||
                antiInsultsSetting.words === 0 ||
                !antiInsultsSetting.enabled ||
                !antiInsultsSetting.action
            ) {
                return resolve(false);
            }

            const isWhitelist = await Automod.checkWhitelist({
                setting: antiInsultsSetting,
                user_roles: message.member.roles.cache.map((r) => r.id),
                guild_id: message.guild.id,
                message: message,
            });
            if (isWhitelist) return resolve(false);

            if (!this.isInsult(message.content, antiInsultsSetting.words)) {
                return resolve(false);
            }

            Automod.punishUser({
                user: message.author,
                guild: message.guild,
                action: antiInsultsSetting.action,
                bot: bot,
                messages: message,
            }).then(() => {
                resolve(true);
            });
        });
    }

    isInsult(content, insults) {
        return insults.some((insult) => content.toLowerCase().includes(insult.toLowerCase()));
    }
};
