const database = require("../src/db/db");
const { getAllRoles } = require("../utils/functions/roles/getAllRoles");
const { saveAllRoles } = require("../utils/functions/roles/saveAllRoles");
const { errorhandler } = require("../utils/functions/errorhandler/errorhandler");

async function guildMemberRemove(member) {
    database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
      if(await res.length == 0) {
        database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, member_roles) VALUES (?, ?)`, [member.user.id, JSON.stringify(await getAllRoles(member)) ]).catch(err => {
          return errorhandler({err})
        });
      }else {
        const allRoles = await getAllRoles(member)
        if(JSON.parse(res[0].member_roles) === allRoles) return;
        else {
          await saveAllRoles(allRoles, member.user, member.guild)
        }
      }
    }).catch(err =>{
      return errorhandler({err})
    });
}

module.exports = {guildMemberRemove}