const database = require('../../../src/db/db');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.updateGlobalConfig = async ({ valueName, value }) => {
    await database
        .query(`UPDATE global_config SET ${valueName} = ? WHERE id = 1`, [JSON.stringify(value)])
        .then(() => {
            globalConfig[0][valueName] = JSON.stringify(value);
        })
        .catch((err) => {
            errorhandler({ err });
        });
};

module.exports.getGlobalConfig = async () => {
    if (globalConfig.length > 0) {
        return globalConfig[0];
    } else {
        return await database
            .query('SELECT * FROM global_config')
            .then((res) => {
                return res[0];
            })
            .catch((err) => {
                errorhandler({ err });
                return false;
            });
    }
};
