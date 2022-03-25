const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require('../errorhandler/errorhandler');



async function saveAllRoles(roles, member, log) {
    database.query(`UPDATE ${member.guild.id}_guild_member_info SET member_roles = ? WHERE user_id = ?`, [JSON.stringify(roles), member.user.id]).catch(err => {
        errorhandler(err, null, null, log, config, true);
    });
}

module.exports = {saveAllRoles}