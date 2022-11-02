const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");

module.exports.getAllGuildIds = async () => {
    return await database.query(`SELECT * FROM all_guild_id`)
        .then(res => {
            if(res.length > 0) {
                return res;
            }else {
                return false;
            }
        })
        .catch(err => {
            errorhandler({err: err, fatal: true});
            return false;
        });
}