const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");
const config = require('../../../src/assets/json/_config/config.json');

module.exports.getPrefix = async ({guildId}) => {

await database.query(`SELECT prefix FROM ${guildId}_config`).then(async res => {

    if(res.length > 0) {
        return res[0].prefix;
    }else {
        return config.defaultprefix;
    }

}).catch(err => {
    errorhandler({err: err, fatal: true});
    return {
        error: true,
        message: "Something went wrong while getting the prefix. I'll use the default Prefix ('"+config.defaultprefix+"') until the bug is fixed."
    };
})

}