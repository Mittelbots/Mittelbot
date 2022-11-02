const allGuildId = require('../../../src/db/Models/tables/allGuildId');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.insertIntoAllGuildId = async (guild_id) => {
    allGuildId.create(
        {
            guild_id: guild_id,
        }
    ).then(() => {
        resolve(true);
    })
    .catch(err => {
        errorhandler({ err });
        return reject(false);
    });
};
