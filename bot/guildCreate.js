const { log } = require('../logs');
const database = require('../src/db/db')



async function guildCreate(guild, bot) {
  await database.query(`SELECT guild_id FROM all_guild_id WHERE guild_id = ?`, [guild.id]).then(async res => {
    if (res.length <= 0) await database.query(`INSERT INTO all_guild_id (guild_id) VALUES (?)`, [guild.id]).catch(err => {})
  });
  await database.query(`CREATE TABLE ${guild.id}_config LIKE _config_template`).then(async () => {
    await database.query(`INSERT INTO ${guild.id}_config (guild_id) VALUES (?)`, [guild.id]).catch(err => {
      log.fatal(err)
    });
  }).catch(err => {
    log.fatal(err)
  });

  let commands = [];
  await bot.commands.map(cmd => {
    commands.push(cmd.help.name);
  });

  await database.query(`INSERT INTO active_commands (active_commands, disabled_commands, guild_id, global_disabled) VALUES (?, ?, ?, ?)`, [JSON.stringify(commands), "[]", guild.id, "[]"]).catch(err => {
    log.fatal(err)
  });

  await database.query(`CREATE TABLE ${guild.id}_guild_logs LIKE _guild_logs_template`).then(async () => {
    // await database.query(`INSERT INTO ${guild.id}_guild_logs (id) VALUES (?)`, [1]).catch(err => {
    //   log.fatal(err)
    // });
  }).catch(err => {
    log.fatal(err)
  });
  await database.query(`CREATE TABLE ${guild.id}_guild_modroles LIKE _guild_modroles_template`).catch(err => {
    log.fatal(err)
  });
  await database.query(`CREATE TABLE ${guild.id}_guild_joinroles LIKE _guild_joinroles_template`).catch(err => {
    log.fatal(err)
  });
  await database.query(`CREATE TABLE ${guild.id}_guild_warnroles LIKE _guild_warnroles_template`).catch(err => {
    log.fatal(err)
  });
  await database.query(`CREATE TABLE ${guild.id}_guild_level LIKE _guild_level_template`).catch(err => {
    log.fatal(err)
  });
  await database.query(`CREATE TABLE ${guild.id}_guild_member_info LIKE _guild_member_info_template`).catch(err => {
    log.fatal(err)
  })

  return;
}

module.exports = {
  guildCreate
}