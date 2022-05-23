const database = require("../../../src/db/db");
const { getAllGuildIds } = require("./getAllGuildIds");

module.exports.getAllModroles = async () => {
    const all_guild_id = await getAllGuildIds();

    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                modroles: await this.getModroles({guild_id: all_guild_id[i].guild_id})
            }
            response.push(obj);
        }
        return response;
    }else {
        return false;
    }
}

module.exports.getModroles = async ({guild_id}) => {
    return await database.query(`SELECT * FROM ${guild_id}_guild_modroles`)
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