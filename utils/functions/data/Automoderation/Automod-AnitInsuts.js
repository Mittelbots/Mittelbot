const { Automod } = require('../Automod');

module.exports = class AutomodAntiInsults {
    constructor(bot) {
        this.bot = bot;
    }

    check(message) {
        return new Promise(async (resolve) => {
            const settings = await Automod.get(message.guild.id);
            const antiInsultsSetting = settings.antiinsults;

            if (
                !antiInsultsSetting ||
                antiInsultsSetting.words === 0 ||
                !antiInsultsSetting.enabled ||
                !antiInsultsSetting.action
            ) {
                return resolve(false);
            }

            const isWhitelist = Automod.checkWhitelist({
                setting: antiInsultsSetting,
                user_roles: message.member.roles.cache,
            });
            if (isWhitelist) return resolve(false);

            if (!this.isInsult(message.content, antiInsultsSetting.words)) {
                return resolve(false);
            }

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

    isInsult(content, insults) {
        return insults.some((insult) => content.toLowerCase().includes(insult.toLowerCase()));
    }
};
