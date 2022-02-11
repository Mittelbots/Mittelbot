const { log } = require("../logs");
const { Database } = require("../src/db/db");
const { getAllRoles } = require("../utils/functions/roles/getAllRoles");
const config = require('../src/assets/json/_config/config.json');
const { saveAllRoles } = require("../utils/functions/roles/saveAllRoles");

const database = new Database();

async function guildMemberRemove(member) {
    database.query(`SELECT * FROM ${member.guild.id}_guild_member_info WHERE user_id = ?`, [member.user.id]).then(async res => {
      if(await res.length == 0) {
        database.query(`INSERT INTO ${member.guild.id}_guild_member_info (user_id, member_roles) VALUES (?, ?)`, [member.user.id, JSON.stringify(await getAllRoles(member)) ]).catch(err => {
          if(config.debug == 'true') console.log(err)
          return log.fatal(err);
        });
      }else {
        const allRoles = await getAllRoles(member)
        if(JSON.parse(res[0].member_roles) === allRoles) return;
        else {
          await saveAllRoles(allRoles, member, log)
        }
      }
    }).catch(err =>{
      if(config.debug == 'true') console.log(err);
      return log.fatal(err)
    });
}

module.exports = {guildMemberRemove}