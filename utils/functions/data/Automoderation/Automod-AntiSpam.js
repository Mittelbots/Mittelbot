const { Automod } = require('../Automod');

module.exports = class AutomodAntiSpam {
    #spamCheck = [];
    #userAction = [];

    #isSpam = false;

    #triggerSeconds = 4;
    #triggerMessages = 6;

    #deleteDataInterval = 1000 * 10;

    constructor() {}

    init(guild_id, bot) {
        return new Promise(async (resolve) => {
            const setting = await Automod.get(guild_id, 'antispam');
            this.antiSpamSetting = setting.antispam;
            this.bot = bot;
            return resolve(this);
        });
    }

    check(message) {
        return new Promise(async (resolve) => {
            this.#isSpam = false;
            this.member = await message.guild.members.fetch(message.author.id);
            this.memberRoles = this.member.roles.cache.map((role) => role.id);

            if (!this.antiSpamSetting || !this.antiSpamSetting.enabled)
                return resolve(this.#isSpam);
            const isWhitelist = await Automod.checkWhitelist({
                setting: this.antiSpamSetting,
                user_roles: this.memberRoles,
                guild_id: message.guild.id,
                message: message,
            });
            if (isWhitelist) return resolve(this.#isSpam);
            const user = this.#spamCheck.find(
                (user) => user.user_id === message.author.id && user.guild_id === message.guild.id
            );
            if (!user) {
                this.addUserToSpamCheck(message.author, message.guild, message);
                return resolve(this.#isSpam);
            }

            const first_message = user.first_message;
            const current_time = new Date().getTime();
            user.messages.push(message.id);

            if (
                user.messages.length < this.#triggerMessages &&
                (this.getDifference(first_message, current_time) > this.#triggerSeconds ||
                    this.getDifference(first_message, current_time) < this.#triggerSeconds)
            ) {
                user.last_message = current_time;
                this.updateSpamCheck(user);
                return resolve(this.#isSpam);
            }

            if (
                !this.antiSpamSetting.action &&
                !this.isAlreadyPunished(message.author, message.guild)
            ) {
                this.#isSpam = false;
                return resolve(this.#isSpam);
            }

            const obj = {
                guild_id: message.guild.id,
                user_id: message.author.id,
                action: '',
            };

            const action = Automod.punishUser({
                user: message.author,
                guild: message.guild,
                mod: message.guild.me,
                action: this.antiSpamSetting.action,
                bot: this.bot,
                messages: user.messages,
                channel: message.channel,
            });

            obj.action = action;
            this.#userAction.push(obj);
            this.#isSpam = true;

            user.first_message = null;
            user.last_message = null;
            user.messages = [];

            this.updateSpamCheck(user);

            return resolve(this.#isSpam);
        });
    }

    isAlreadyPunished(author, guild) {
        return (
            this.#userAction.filter(
                (u) =>
                    u.user_id === author.id && (u.guild_id === guild.id) & (u.action !== 'delete')
            ).length === 0
        );
    }

    addUserToSpamCheck(author, guild, message) {
        const user = {
            guild_id: guild.id,
            user_id: author.id,
            first_message: new Date().getTime(),
            last_message: new Date().getTime(),
            messages: [message.id],
        };
        this.#spamCheck.push(user);

        this.removeUserFromSpamCheck(user);
    }

    updateSpamCheck(user) {
        for (let i in this.#spamCheck) {
            if (
                this.#spamCheck[i].user_id === user.user_id &&
                this.#spamCheck[i].guild_id === user.guild_id
            ) {
                this.#spamCheck[i] = user;
                break;
            }
        }
    }

    getDifference(first_message, current_time) {
        return Math.abs((first_message - current_time) / 1000);
    }

    removeUserFromSpamCheck(user) {
        setTimeout(() => {
            this.#userAction = this.#userAction.filter(
                (u) => u.guild_id !== user.guild_id && u.user_id !== user.user_id
            );
            this.#spamCheck = this.#spamCheck.filter(
                (u) => u.guild_id !== user.guild_id && u.user_id !== user.user_id
            );
        }, this.#deleteDataInterval);
    }
};
