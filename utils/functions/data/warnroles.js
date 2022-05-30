const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getAllGuildIds } = require("./getAllGuildIds");
const config = require('../../../src/assets/json/_config/config.json');

module.exports.getAllWarnroles = async () => {

    const all_guild_id = await getAllGuildIds();

    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                warnroles: await this.getWarnroles({guild_id: all_guild_id[i].guild_id})
            }
            response.push(obj);
        }
        return response;
    }else {
        return false;
    }
}

module.exports.getWarnroles = async ({guild_id}) => {
    return await database.query(`SELECT * FROM ${guild_id}_guild_warnroles`)
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


module.exports.checkWarnroles = async ({guild, role_id}) => {
    const role = guild.roles.cache.get(role_id);

    if(role) return true;
    else return false;
}


module.exports.addWarnroles = async ({guild_id, warnrole_id}) => {
    return await database.query(`INSERT INTO ${guild_id}_guild_warnroles (${config.settings.warnroles.colname}) VALUES (?)`, [warnrole_id])
    .then(() => {
        return {
            error: false
        }
    })
    .catch(err => {
        errorhandler({
            err,
            fatal: true
        });
        return {
            error: true,
            message: "An error occured while adding the warnrole"
        }
        
    });
}

module.exports.removeWarnroles = async ({guild_id, warnrole_id}) => {
    return await database.query(`DELETE FROM ${guild_id}_guild_warnroles WHERE role_id = ?`, [warnrole_id])
    .then(() => {
        return {
            error:false
        }
    })
    .catch(err => {
        errorhandler({
            err,
            fatal: true
        });
        return {
            error: true,
            message: "An error occured while removing the warnrole"
        }
    });
}