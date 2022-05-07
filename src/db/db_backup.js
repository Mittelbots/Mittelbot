const dbconfig = require('./db_config.json');
const exec = require('child_process').exec;


module.exports.db_backup = () => {
  exec(` mysqldump -u root -p${dbconfig.password} ${dbconfig.database} > ${dbconfig.backup_repo}/${new Date().getDay()+'_'+new Date().getMonth()+'_'+new Date().getFullYear()}.backup.sql`);
}