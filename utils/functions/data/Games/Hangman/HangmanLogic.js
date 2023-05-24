const games = require("../../../../../src/db/Models/tables/games.model");

module.exports = class HangmanLogic {
    constructor() {
        this.guild = this.interaction.guild;
        this.channel = this.interaction.channel;
        this.user = this.interaction.user;
    }

    get() {
        return new Promise(async (resolve, reject) => {
            games.findOne({
                where: {
                    guild_id: this.guild.id,
                    channel_id: this.channel.id,
                }
            }).then((game) => {
                resolve(game);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    set(config) {
        return new Promise(async (resolve, reject) => {
            const existAlready = await this.get();
            if(existAlready) {
                return reject("Game already exists")
            }

            games.findOne({
                where: {
                    guild_id: this.guild.id,
                    channel_id: this.channel.id,
                    config: config,
                }
            }).then((game) => {
                resolve(game);
            }).catch((err) => {
                reject(err);
            });
        });
    }
}