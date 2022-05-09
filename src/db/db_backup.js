const dbconfig = require('./db_config.json');
const exec = require('child_process').exec;


module.exports.db_backup = () => {
  exec(` mysqldump -u ${dbconfig.user} -p${dbconfig.password} ${dbconfig.database} > ${dbconfig.backup_repo}/${new Date().getDay()+'_'+new Date().getMonth()+'_'+new Date().getFullYear()}.backup.sql`, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
        console.log(`exec error: ${error}`);
    }
  });
  setTimeout(() => {
    exec(` cd ${dbconfig.backup_repo} && git add . && git commit -m "${dbconfig.backup_repo}" && git push`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
          console.log(`exec error: ${error}`);
      }
    });
    console.info(`Database backuped successfully`);
  }, 10000); //10s
  return true;
}