const database = require("../../../src/db/db");
const { getAllGuildIds } = require("./getAllGuildIds");
const { getFromCache } = require('../cache/cache');
const { errorhandler } = require("../errorhandler/errorhandler");

module.exports.getAllMemberInfo = async () => {

    const all_guild_id = await getAllGuildIds();

    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                member_info: await this.getMemberInfo({guild_id: all_guild_id[i].guild_id})
            }
            response.push(obj);
        }
        return response;
    }else {
        return false;
    }

}

module.exports.getMemberInfo = async ({guild_id}) => {

    const cache = getFromCache({
        cacheName: "memberInfo",
        guild_id: guild_id,
    });

    console.log(cache);

    return await database.query(`SELECT * FROM ${guild_id}_guild_member_info`)
    .then(res => {
        if(res.length > 0) {
            return res;
        }else {
            return false;
        }
    })
    .catch(err => {
        errorhandler({err: err, fatal: true});
        return {
            error: true
        };
    });
}

module.exports.getMemberInfoById = async ({guild_id, user_id}) => {
    return await database.query(`SELECT * FROM ${guild_id}_guild_member_info WHERE user_id = ?`, [user_id])
    .then(res => {
        if(res.length > 0) {
            return res[0];
        }else {
            return false;
        }
    })
    .catch(err => {
        errorhandler({err: err, fatal: true});
        return {
            error: true
        };
    });
}

module.exports.updateMemberInfoById = async ({guild_id, user_id, member_roles = [], user_joined = null}) => {
    return await database.query(`UPDATE ${guild_id}_guild_member_info SET member_roles = ?, user_joined = ? WHERE user_id = ?`, [member_roles, user_joined, user_id])
    .then(() => {
        return true;
    })
    .catch(err => {
        errorhandler({err: err, fatal: true});
        return false;
    });
}

module.exports.insertMemberInfo = async ({guild_id, user_id, member_roles = [], user_joined = null}) => {
    return await database.query(`INSERT INTO ${guild_id}_guild_member_info (user_id, member_roles, user_joined) VALUES (${user_id}, '${member_roles}', '${user_joined}')`)
    .then(() => {
        return true;
    })
    .catch(err => {
        errorhandler({err: err, fatal: true});
        return false;
    });
}