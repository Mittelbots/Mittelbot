const globalConfig = require('~src/db/Models/globalConfig.model');

class GlobalConfig {
    constructor() {}

    get() {
        return new Promise(async (resolve, reject) => {
            await globalConfig
                .findAll()
                .then((data) => {
                    return resolve(data[0]);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    update({ valueName, value }) {
        return new Promise(async (resolve, reject) => {
            await globalConfig
                .update(
                    {
                        [valueName]: value,
                    },
                    {
                        where: {
                            id: 1,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }
}

module.exports = GlobalConfig;
