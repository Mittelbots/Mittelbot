const { log } = require("../logs");
const { Database } = require("../src/db/db");
const { getAllRoles } = require("../utils/functions/roles/getAllRoles");

async function guildMemberRemove(member) {
    const database = new Database();
  
    database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
      if(await res.length == 0) {
        database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, member_roles) VALUES (?, ?)`, [member.user.id, JSON.stringify(await getAllRoles(member)) ]).catch(err => {
          if(config.debug == 'true') console.log(err)
          return log.fatal(err);
        });
      }else {
        if(JSON.parse(res[0].member_roles) === await getAllRoles(member)) return;
        else {
          database.query(`UPDATE ${member.guild.id}_guild_member_info SET member_roles = ? WHERE user_id = ?`, [JSON.stringify(await getAllRoles(member)), member.user.id]).catch(err => {
            if(config.debug == 'true') console.log(err)
            return log.fatal(err);
          })
        }
      }
    }).catch(err =>{
      if(config.debug == 'true') console.log(err);
      return log.fatal(err)
    });
}

module.exports = {guildMemberRemove}