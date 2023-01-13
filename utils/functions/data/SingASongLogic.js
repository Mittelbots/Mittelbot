const { default: axios } = require('axios');
const { sequelize } = require('../../../src/db/Models/tables/singasong.model');
const singasong = require('../../../src/db/Models/tables/singasong.model');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports = class SingASongLogic {
    constructor() {}

    checkUser(user) {
        if (user.banned) return 'You have been banned from using this command!';
        if (user.isCurrentlyPlaying) return 'You are already playing a game!';
    }

    getUser() {
        return new Promise(async (resolve, reject) => {
            await singasong
                .findOne({
                    where: {
                        user_id: this.author.id,
                    },
                })
                .then((user) => {
                    if (user) return resolve(user);
                    return resolve(false);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return resolve(true);
                });
        });
    }

    isAlreadyOtherEventStarted() {
        return new Promise(async (resolve, reject) => {
            await singasong
                .findOne({
                    where: {
                        guild_id: this.main_interaction.guild.id,
                        isCurrentlyPlaying: true,
                    },
                })
                .then((user) => {
                    if (user) return resolve(true);
                    return resolve(false);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(true);
                });
        });
    }

    createUser() {
        return new Promise(async (resolve, reject) => {
            await singasong
                .create({
                    user_id: this.author.id,
                    guild_id: this.main_interaction.guild.id,
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(`An error occured while i created some data!`);
                });
        });
    }

    getSentence() {
        return new Promise(async (resolve, reject) => {
            axios
                .get(this.API_URL)
                .then(async (res) => {
                    this.quote = await res.data.content;
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    this.quote = false;
                    reject(true);
                });
        });
    }

    updateUser({ points = 0, used_sentences = [], isCurrentlyPlaying = false, banned = false }) {
        return new Promise(async (resolve, reject) => {
            await singasong
                .update(
                    {
                        points,
                        used_sentences,
                        isCurrentlyPlaying,
                        banned,
                    },
                    {
                        where: {
                            user_id: this.author.id,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(false);
                });
        });
    }

    getLastSentence() {
        return new Promise(async (resolve, reject) => {
            const user = await this.getUser();
            if (user) {
                this.lastSentence = user.used_sentences[user.used_sentences.length - 1];
                return resolve(true);
            }
            return resolve(false);
        });
    }

    isUserPlaying() {
        return new Promise(async (resolve, reject) => {
            await singasong
                .findOne({
                    where: {
                        user_id: this.author.id,
                    },
                })
                .then((user) => {
                    if (user) {
                        if (user.isCurrentlyPlaying) return resolve(true);
                        return resolve(false);
                    }
                    return resolve(false);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(false);
                });
        });
    }

    isSentenceAlreadyUsed() {
        return new Promise(async (resolve, reject) => {
            await singasong
                .findOne({
                    where: {
                        user_id: this.author.id,
                    },
                })
                .then((user) => {
                    if (user) {
                        if (user.used_sentences.includes(this.quote)) return resolve(true);
                        return resolve(false);
                    }
                    return resolve(false);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(false);
                });
        });
    }

    givePoints() {
        return new Promise(async (resolve, reject) => {
            await singasong
                .update(
                    {
                        points: sequelize.literal(`points + ${this.points}`),
                    },
                    {
                        where: {
                            user_id: this.author.id,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(false);
                });
        });
    }
};
