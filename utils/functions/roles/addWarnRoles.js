const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const { insertDataToTemproles } = require("../insertDataToDatabase");



async function addWarnRoles(message, member, inf_id, config, log) {
    return await database.query(`SELECT role_id FROM ${message.guild.id}_guild_warnroles`).then(async res => {
        let hasRoleAlready = false;
        if(res.length > 0) {   
            for(let i in res) {
                let role = await message.guild.roles.cache.find(role => role.id === res[i].role_id).id
                if(!member.roles.cache.has(role)) {
                    return await member.roles.add([role])
                        .then(() => {
                            insertDataToTemproles(member.id, res[i].role_id, getFutureDate(2678400), inf_id, message.guild.id);
                            return true;
                        })
                        .catch(err => {
                            errorhandler(err, config.errormessages.nopermissions.manageRoles, message.channel, log, config);
                            return false;
                        })
                }else {
                    hasRoleAlready = true;
                }
            }
            if(hasRoleAlready) {
                //If User already have all Roles
                message.channel.send(`\`This User already have all warn roles!\``);
                return true;
            }
        }else {
            return true;
        }
    }).catch(err => {
        errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config, true);
        return false;
    })
}

module.exports = {
    addWarnRoles
};
