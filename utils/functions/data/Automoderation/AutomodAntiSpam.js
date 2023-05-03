const { Automod } = require("../Automod")

module.exports = class AutomodAntiSpam {

    #spamCheck = [];
    #userAction = [];

    #isSpam = false;

    #triggerSeconds = 4;
    #triggerMessages = 6;

    constructor() {}

    async init(guild_id) {
        const setting = await Automod.get(guild_id);
        this.antiSpamSetting = setting.antispam;
    }

    async check(message) {
        return new Promise(async (resolve, reject) => {
            this.member = await message.guild.members.fetch(message.author.id);
            this.memberRoles = this.member.roles.cache.map((role) => role.id);

            if (!this.antiSpamSetting || !this.antiSpamSetting.enabled) return resolve();

            const isWhitelist = Automod.checkWhitelist({
                setting: this.antiSpamSetting,
                user_roles: this.memberRoles,
            });
            if (!isWhitelist) return resolve(this.#isSpam);

            const user = this.#spamCheck.find(
                (user) => user.user_id === message.author.id && user.guild_id === message.guild.id
            );

            if(!user) {
                this.addUserToSpamCheck(message.author, message.guild);
                return resolve(this.#isSpam);
            }

            const first_message = user.first_message;
            const current_time = new Date().getTime();
            user.messages.push(message);

            if((user.messages.length < this.#triggerMessages && this.getDifference(first_message, current_time) > this.#triggerSeconds) || (user.messages.length < this.#triggerMessages && this.getDifference(first_message, current_time) > this.#triggerSeconds)) {
                this.#isSpam = false;
                return resolve(this.#isSpam);
            }

            user.first_message = current_time;
            if(!this.antiSpamSetting.action && !this.isAlreadyPunished(message.author, message.guild)) {
                this.#isSpam = false;
                return resolve(this.#isSpam);
            }

            
        });
    }

    isAlreadyPunished(author, guild) {
        return this.#userAction.filter(
            (u) =>
                u.user_id === author.id &&
                (u.guild_id === guild.id) & (u.action !== 'delete')
        ).length === 0;
    }

    addUserToSpamCheck(author, guild) {
        this.#spamCheck.push({
            guild_id: guild.id,
            user_id: author.id,
            first_message: new Date().getTime(),
            messages: [message]
        });
    }

    getDifference(first_message, current_time) {
        return Math.abs((first_message - current_time) / 1000);
    }
}