const allGuildId = require('../../../src/db/Models/tables/guilds.model');
const { errorhandler } = require('../errorhandler/errorhandler');
const blacklist = require('../../../src/assets/json/blacklist/guilds.json');

class Guilds {
    constructor() {}

    async create(guild_id) {
        return new Promise(async (resolve, reject) => {
            allGuildId
                .create(
                    {
                        guild_id,
                    },
                    {
                        ignoreDuplicates: true,
                    }
                )
                .then(async (guild) => {
                    await guild.createConfig({}, { ignoreDuplicates: true });
                    await guild.createAutomod({}, { ignoreDuplicates: true });
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            allGuildId
                .findOne({
                    where: {
                        guild_id,
                    },
                })
                .then((guild) => {
                    if (!guild) {
                        return reject(false);
                    }
                    return resolve(guild);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
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

    isBlacklist(guild_id) {
        return new Promise(async (resolve) => {
            return resolve(blacklist.find((g) => g === guild_id));
        });
    }
}

module.exports.Guilds = new Guilds();
