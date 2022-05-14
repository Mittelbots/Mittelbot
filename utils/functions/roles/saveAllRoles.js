const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require('../errorhandler/errorhandler');



async function saveAllRoles(roles, member, log, guild_id) {
    await database.query(`SELECT id FROM ${guild_id.id}_guild_member_info WHERE user_id = ?`, [member.id])
        .then(async res => {
            if(res.length === 0) {
                await database.query(`INSERT INTO ${guild_id.id}_guild_member_info (user_id, member_roles) VALUES (?, ?)`, [member.id, JSON.stringify(roles)])
                    .catch(err => {
                        return errorhandler({err, fatal: true});
                    });
            }else {
                await database.query(`UPDATE ${guild_id.id}_guild_member_info SET member_roles = ? WHERE user_id = ?`, [JSON.stringify(roles), member.id])
                    .catch(err => {
                        return errorhandler({err, fatal: true});
                    });
            }
        }).catch(err => {
            return errorhandler({err, fatal: true});
        })

}

module.exports = {saveAllRoles}