const { GuildConfig } = require('../Config');

module.exports = class TicketSettings {
    constructor() {}

    getSettings() {
        return new Promise(async (resolve, reject) => {
            await GuildConfig.get(this.main_interaction.guild.id)
                .then(async (config) => {
                    return resolve(config.tickets);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    isAlreadyCreated() {
        return new Promise(async (resolve, reject) => {
            await this.getSettings()
                .then(async (settings) => {})
                .catch(() => {
                    return reject(false);
                });
        });
    }
};
