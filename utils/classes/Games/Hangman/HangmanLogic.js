const games = require('~src/db/Models/games.model');

let cooldown = new Set();

class HangmanLogic {
    constructor(interaction, bot) {
        this.bot = bot;
        if (!interaction) return;
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        this.user = interaction.user;
    }

    get(channel_id) {
        return new Promise(async (resolve, reject) => {
            games
                .findOne({
                    where: {
                        channel_id: channel_id,
                    },
                })
                .then((game) => {
                    resolve(game);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    set(config) {
        return new Promise(async (resolve, reject) => {
            games
                .create({
                    channel_id: this.channel.id,
                    config: config,
                })
                .then((game) => {
                    resolve(game);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    update(config, channel_id) {
        return new Promise(async (resolve, reject) => {
            games
                .update(
                    {
                        config: config,
                    },
                    {
                        where: {
                            channel_id: channel_id,
                        },
                    }
                )
                .then((game) => {
                    resolve(game);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    delete(channel_id) {
        return new Promise(async (resolve, reject) => {
            games
                .destroy({
                    where: {
                        channel_id: channel_id,
                    },
                })
                .then((game) => {
                    resolve(game);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    cooldown(author_id, channel_id) {
        const data = `${author_id}-${channel_id}`;
        if (cooldown.has(data)) {
            return true;
        }

        cooldown.add(data);
        setTimeout(() => {
            cooldown.delete(data);
        }, 5000);
        return false;
    }
}

module.exports = HangmanLogic;
