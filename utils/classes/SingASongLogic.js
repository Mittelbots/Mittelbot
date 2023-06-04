const { default: axios } = require('axios');
const { sequelize } = require('~src/db/Models/singasong.model');
const singasong = require('~src/db/Models/singasong.model');

module.exports = class SingASongLogic {
    constructor() {}

    checkUser(user) {
        if (user.banned.includes(this.main_interaction.guild.id))
            return 'You have been banned from using this command!';
        if (user.isCurrentlyPlaying) return 'You are already playing a game!';
    }

    getUser() {
        return new Promise(async (resolve) => {
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
                    return reject(true);
                });
        });
    }

    createUser(sentence) {
        return new Promise(async (resolve, reject) => {
            await singasong
                .create({
                    user_id: this.author.id,
                    guild_id: this.main_interaction.guild.id,
                    isCurrentlyPlaying: true,
                    used_sentences: [sentence],
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
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
                    this.quote = false;
                    reject(true);
                });
        });
    }

    updateUser({ points = 0, used_sentences = [], isCurrentlyPlaying = false }) {
        return new Promise(async (resolve, reject) => {
            await singasong
                .update(
                    {
                        points,
                        used_sentences,
                        isCurrentlyPlaying,
                        guild_id: this.main_interaction.guild.id,
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
                    return reject(false);
                });
        });
    }

    getPointsFromUser(user_id) {
        return new Promise(async (resolve, reject) => {
            await singasong
                .findOne({
                    where: {
                        user_id,
                    },
                })
                .then((user) => {
                    if (user) return resolve(user.points);
                    return resolve(false);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    banUser(user_id, guild_id) {
        return new Promise(async (resolve, reject) => {
            const user = await singasong
                .findOne({
                    where: {
                        user_id,
                    },
                })
                .catch((err) => {
                    return reject(false);
                });

            if (user) {
                user.banned.push(guild_id);
                await singasong
                    .update(
                        {
                            banned: user.banned,
                        },
                        {
                            where: {
                                user_id,
                            },
                        }
                    )
                    .catch((err) => {
                        return reject(false);
                    });
            } else {
                await singasong
                    .create({
                        user_id,
                        banned: [guild_id],
                    })
                    .catch((err) => {
                        return reject(false);
                    });
            }
            return resolve(true);
        });
    }

    isUserBanned() {
        return new Promise(async (resolve) => {
            const user = await this.getUser();
            if (user) {
                if (user.banned.includes(this.main_interaction.guild.id)) return resolve(true);
            }
            return resolve(false);
        });
    }
};
