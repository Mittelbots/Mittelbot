const { default: axios } = require('axios');
const reddit = require('~src/db/Models/reddit.model');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');

class Reddit {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            reddit
                .findOne({
                    where: {
                        guild_id,
                    },
                })
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    save({ guild_id, channel_id, subreddit, pingrole_id, allow_nsfw, override }) {
        return new Promise(async (resolve, reject) => {
            if (override) {
                reddit
                    .update(
                        {
                            channel_id,
                            subreddit,
                            pingrole_id,
                            allow_nsfw,
                        },
                        {
                            where: {
                                guild_id,
                            },
                        }
                    )
                    .then((data) => {
                        return resolve(data);
                    })
                    .catch((err) => {
                        return reject(false);
                    });
            } else {
                reddit
                    .create({
                        guild_id,
                        channel_id,
                        subreddit,
                        pingrole_id,
                        allow_nsfw,
                    })
                    .then((data) => {
                        return resolve(data);
                    })
                    .catch((err) => {
                        return reject(false);
                    });
            }
        });
    }
    remove(guild_id) {
        return new Promise(async (resolve, reject) => {
            reddit
                .destroy({
                    where: {
                        guild_id,
                    },
                })
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    getAll() {
        return new Promise(async (resolve, reject) => {
            reddit
                .findAll()
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    baseUrl() {
        return 'https://www.reddit.com/r';
    }

    updateUploads(guild_id, uploads) {
        return new Promise(async (resolve, reject) => {
            reddit
                .update(
                    {
                        uploads,
                    },
                    {
                        where: {
                            guild_id,
                        },
                    }
                )
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    addSubReddit({ guild_id, subreddit, pingrole, allowNsfw }) {
        return new Promise(async (resolve, reject) => {
            reddit
                .create({
                    guild_id,
                    subreddit,
                    pingrole,
                    allowNsfw,
                })
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    getSubreddit(subreddit) {
        return new Promise(async (resolve) => {
            try {
                const url = new URL(subreddit);
                subreddit = url.pathname.split('/')[2];
                if (!subreddit) return resolve(false);
                return resolve(subreddit);
            } catch (err) {
                return await axios
                    .get(`${this.baseUrl()}/${subreddit}/new.json?sort=new`)
                    .then(() => {
                        return resolve(subreddit);
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                        });
                        return resolve(false);
                    });
            }
        });
    }
}

module.exports = Reddit;
