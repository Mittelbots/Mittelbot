const allGuildId = require('~src/db/Models/guilds.model');
const blacklist = require('~assets/json/blacklist/guilds.json');
const { Guild } = require('discord.js');

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
                    return reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            if (!guild_id) return reject(false);
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
            .catch(() => {
                return false;
            });
    }

    isBlacklist(guild_id) {
        return new Promise(async (resolve) => {
            return resolve(blacklist.find((g) => g === guild_id));
        });
    }

    amIOnThisServer(guild_id, bot) {
        return new Promise(async (resolve) => {
            return resolve(typeof bot.guilds.cache.get(guild_id) === Guild);
        });
    }
}

module.exports = Guilds;
