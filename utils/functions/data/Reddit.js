const reddit = require("../../../src/db/Models/tables/reddit.model");
const { errorhandler } = require("../errorhandler/errorhandler");

class Reddit {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            reddit.findOne({
                where: {
                    guild_id,
                }
            }).then((data) => {
                return resolve(data);
            })
            .catch((err) => {
                errorhandler({err})
                return reject(false);
            });
        });
    }

    getAll() {
        return new Promise(async (resolve, reject) => {
            reddit.findAll().then((data) => {
                return resolve(data);
            })
            .catch((err) => {
                errorhandler({err})
                return reject(false);
            });
        });
    }

    baseUrl() {
        return "https://www.reddit.com/r";
    }

    updateUploads(guild_id, uploads) {
        return new Promise(async (resolve, reject) => {
            reddit.update({
                uploads,
            }, {
                where: {
                    guild_id,
                }
            }).then((data) => {
                return resolve(data);
            })
            .catch((err) => {
                errorhandler({err})
                return reject(false);
            });
        });
    }
}

module.exports = Reddit;