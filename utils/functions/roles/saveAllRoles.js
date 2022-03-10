const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json')



async function saveAllRoles(roles, member, log) {
    database.query(`UPDATE ${member.guild.id}_guild_member_info SET member_roles = ? WHERE user_id = ?`, [JSON.stringify(roles), member.user.id]).catch(err => {
        if(config.debug == 'true') console.log(err)
        return log.fatal(err);
      })
}

module.exports = {saveAllRoles}