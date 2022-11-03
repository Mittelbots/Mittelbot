const allGuildId = require('../../../src/db/Models/tables/guilds.model');
const { errorhandler } = require('../errorhandler/errorhandler');

class Guilds {
    constructor() {}

    async insert(guild_id) {
        allGuildId
            .create({
                guild_id,
            })
            .then(() => {
                resolve(true);
            })
            .catch((err) => {
                errorhandler({ err });
                return reject(false);
            });
    }

    async getAll() {
        return await allGuildId
            .findAll()
            .then((res) => {
                return res.length > 0 ? res : false;
            })
            .catch((err) => {
                errorhandler({ err: err, fatal: true });
                return false;
            });
    }
}

module.exports = new Guilds();
