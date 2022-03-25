const database = require("../../src/db/db");
const { errorhandler } = require("./errorhandler/errorhandler");
const config = require('../../src/assets/json/_config/config.json');
const { log } = require("../../logs");



async function isMod(member, message) {
    return database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(async (res) => {
        var isMod = false
        for (let i in await res) {
            if(member.roles.cache.find(r => r.id === res[i].role_id) !== undefined) {
                isMod = true;
                break;
            }
        }
        return isMod;
    }).catch(err => {
        errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config, true);
    })
}

module.exports = {isMod}