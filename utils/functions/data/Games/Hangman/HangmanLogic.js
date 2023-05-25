const games = require('../../../../../src/db/Models/tables/games.model');

class HangmanLogic {
    constructor(interaction) {
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
}

module.exports = HangmanLogic;
