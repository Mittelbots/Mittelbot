const games = require('../../../../../src/db/Models/tables/games.model');

class HangmanLogic {
    constructor(interaction) {
        this.guild = interaction.guild;
        this.channel = interaction.channel;
        this.user = interaction.user;
    }

    get() {
        return new Promise(async (resolve, reject) => {
            games
                .findOne({
                    where: {
                        guild_id: this.guild.id,
                        channel_id: this.channel.id,
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
                    guild_id: this.guild.id,
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
}

module.exports = HangmanLogic;
