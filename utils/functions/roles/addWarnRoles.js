const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const config = require('../../../src/assets/json/_config/config.json');
const { insertIntoTemproles } = require("../data/infractions");

module.exports.addWarnRoles = async ({user, inf_id, guild}) => {
    return await database.query(`SELECT role_id FROM ${guild.id}_guild_warnroles`).then(async res => {
        let hasRoleAlready = false;
        if(res.length > 0) {   
            for(let i in res) {
                let role = await guild.roles.cache.find(role => role.id === res[i].role_id).id
                const guild_user = await guild.members.cache.get(user.id)
                if(guild_user){
                    if(!guild_user.roles.cache.has(role)) {
                        return await guild_user.roles.add([role])
                            .then(() => {
                                insertIntoTemproles(user.id, res[i].role_id, getFutureDate(2678400), inf_id, guild.id);
                                return true;
                            })
                            .catch(err => {
                                errorhandler({err});
                                return {
                                    error: true,
                                    message: config.errormessages.nopermissions.manageRoles
                                };
                            })
                    }else {
                        hasRoleAlready = true;
                    }
                }
                return true;
            }
            if(hasRoleAlready) {
                //If User already have all Roles
                return {
                    error: false,
                    message: 'This User already have all warn roles!'
                }
            }
        }else {
            return true;
        }
    }).catch(err => {
        errorhandler({err, fatal: true});
        return {
            error: true,
            message: config.errormessages.general
        }
    })
}