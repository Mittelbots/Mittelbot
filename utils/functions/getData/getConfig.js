const database = require("../../../src/db/db");
const { getAllGuildIds } = require("./getAllGuildIds");

module.exports.getAllConfig = async () => {
    const all_guild_id = await getAllGuildIds();

    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            response.push(await this.getConfig({guild_id: all_guild_id[i].guild_id}));
        }
        return response;
    }else {
        return false;
    }
}


module.exports.getConfig = async ({guild_id}) => {
    return await database.query(`SELECT * FROM ${guild_id}_config`)
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