const database = require('../../../src/db/db');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.getStartConfig = async (guild_id) => {
    return await database
        .query(`SELECT start FROM guild_config WHERE guild_id = ?`, [guild_id])
        .then((res) => {
            return res[0].start;
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
        });
};
