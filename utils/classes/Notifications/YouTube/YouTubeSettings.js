const guildUploads = require('~src/db/Models/guildUploads.model');
const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const YouTubeLogic = require('./YouTubeLogic');

module.exports = class YouTubeSettings extends YouTubeLogic {
    MAX_CHANNELS = 3;

    constructor(guild_id) {
        super();
        this.guild_id = guild_id;
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            await guildUploads
                .findAll({
                    where: {
                        guild_id: guild_id,
                    },
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    set({ guild_id, channel_id, info_channel_id, pingrole, uploads }) {
        return new Promise(async (resolve, reject) => {
            guildUploads
                .create({
                    guild_id: guild_id,
                    channel_id: channel_id,
                    info_channel_id: info_channel_id,
                    pingrole: pingrole,
                    uploads: uploads,
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(err);
                });
        });
    }

    remove({ guild_id, channel_id }) {
        return new Promise(async (resolve, reject) => {
            guildUploads
                .destroy({
                    where: {
                        guild_id: guild_id,
                        channel_id: channel_id,
                    },
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(err);
                });
        });
    }
};
