const database = require("../../../src/db/db")
const { errorhandler } = require("../errorhandler/errorhandler")

module.exports.insertIntoAllGuildId = async (guild_id) => {
    return new Promise(async (resolve, reject) => {
        await database.query(`INSERT IGNORE INTO all_guild_id (guild_id) VALUES (?)`, [guild_id])
        .then(() => {
            return resolve(true);
        }).catch(err => {
            errorhandler({err});
            return reject(false);
        })
    })

}