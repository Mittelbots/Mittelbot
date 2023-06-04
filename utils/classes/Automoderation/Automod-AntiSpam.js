const Automod = require('../Automod');
const { isValidLink } = require('~utils/functions/validate/isValidLink');

module.exports = class AutomodAntiSpam {
    #spamCheck = [];
    #userAction = [];

    #isSpam = false;

    #triggerSeconds = 4;
    #triggerMessages = 6;

    #deleteDataInterval = 1000 * 10;

    pingLimitMin = 3;
    maxSameCharacters = 12;
    maxSameWords = 5;
    maxWordLength = 55;

    constructor() {}

    init(guild_id, bot) {
        return new Promise(async (resolve) => {
            this.antiSpamSetting = await new Automod().get(guild_id, 'antispam');
            this.bot = bot;
            return resolve(this);
        });
    }

    check(message) {
        return new Promise(async (resolve) => {
            this.#isSpam = false;
            this.member = await message.guild.members.fetch(message.author.id);
            this.memberRoles = this.member.roles.cache.map((role) => role.id);

            if (!this.antiSpamSetting || !this.antiSpamSetting?.enabled) {
                return resolve(this.#isSpam);
            }

            const isWhitelist = await new Automod().checkWhitelist({
                setting: this.antiSpamSetting,
                user_roles: this.memberRoles,
                guild_id: message.guild.id,
                message: message,
            });
            if (isWhitelist) {
                return resolve(this.#isSpam);
            }

            const hasDublicatedWordsOrCharacters = this.hasDublicatedWordsOrCharacters(
                message.content,
                this.antiSpamSetting.detectduplicate
            );
            const pingLimitReached = this.pingLimitReached(message, this.antiSpamSetting.pinglimit);

            const user = this.#spamCheck.find(
                (user) => user.user_id === message.author.id && user.guild_id === message.guild.id
            );

            if (!user) {
                this.addUserToSpamCheck(message.author, message.guild, message);
                return resolve(this.#isSpam);
            }

            if (!hasDublicatedWordsOrCharacters && !pingLimitReached) {
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
            }

            const obj = {
                guild_id: message.guild.id,
                user_id: message.author.id,
                action: '',
            };

            const action = new Automod().punishUser({
                user: message.author,
                guild: message.guild,
                mod: message.guild.me,
                action: this.antiSpamSetting.action,
                bot: this.bot,
                messages:
                    hasDublicatedWordsOrCharacters || pingLimitReached ? message : user.messages,
                channel: message.channel,
                reason: '[ANTI SPAM] Spamming too many letters in a short time.',
            });

            obj.action = action;
            this.#userAction.push(obj);
            this.#isSpam = true;

            try {
                user.first_message = null;
                user.last_message = null;
                user.messages = [];

                this.updateSpamCheck(user);
            } catch (e) {
                // appears when pinglimit or duplicate is triggered
            }

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

    hasDublicatedWordsOrCharacters(message, isEnabled) {
        if (!isEnabled) return false;

        const words = message.split(/\s+/);
        let prevWord = null;
        let wordCount = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word.length >= this.maxWordLength && !isValidLink(word)) {
                return true;
            }

            if (word === prevWord) {
                wordCount++;
                if (wordCount >= this.maxSameWords) {
                    return true;
                }
            } else {
                prevWord = word;
                wordCount = 1;
            }

            let prevChar = null;
            let charCount = 0;

            for (let j = 0; j < word.length; j++) {
                const char = word[j];
                if (char === prevChar) {
                    charCount++;
                    if (charCount >= this.maxSameCharacters) {
                        return true;
                    }
                } else {
                    prevChar = char;
                    charCount = 1;
                }
            }
        }

        return false;
    }

    pingLimitReached(message, pingLimit) {
        if (pingLimit < this.pingLimitMin) return false;

        const pingedUsers = message.mentions.users.map((user) => user.id);
        const pingedMembers = message.mentions.members.map((members) => members.id);
        const pingedRoles = message.mentions.roles.map((roles) => roles.id);
        const pingedChannels = message.mentions.channels.map((channels) => channels.id);

        const pinged = [...pingedUsers, ...pingedMembers, ...pingedRoles, ...pingedChannels];

        return pinged.length >= pingLimit;
    }
};
