const dbconfig = require('./db_config.json');
const exec = require('child_process').exec;


module.exports.db_backup = () => {
  exec(` mysqldump -u ${dbconfig.user} -p${dbconfig.password} ${dbconfig.database} > ${dbconfig.backup_repo}/${new Date().getDay()+'_'+new Date().getMonth()+'_'+new Date().getFullYear()}.backup.sql`);
  exec(` cd ${dbconfig.backup_repo} && git add . && git commit -m "${dbconfig.backup_repo}" && git push`);

  console.info(`Database backuped successfully`);
  return true;
}