const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const { insertDataToTemproles } = require("../insertDataToDatabase");

async function addWarnRoles(db, message, member, inf_id, config, log) {
    db.query(`SELECT role_id FROM ${message.guild.id}_guild_warnroles`).then(async res => {
        if(res.length > 0) {   

            for(let i in res) {
                let role = await message.guild.roles.cache.find(role => role.id === res[i].role_id).id
                if(!member.roles.cache.has(role)) {
                    await member.roles.add([role]);
                    return insertDataToTemproles(member.id, res[i].role_id, getFutureDate(2678400), inf_id, message.guild.id);
                }
            }
            //If User already have all Roles
            return message.channel.send(`\`The User already have all warn roles!\``);
        }
        return;
    }).catch(err => {
        return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config)
    })
}

module.exports = {
    addWarnRoles
};
