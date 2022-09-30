const dbconfig = require('./db_config.json');
const exec = require('child_process').exec;
const fs = require('fs')
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');


module.exports.db_backup = () => {
  const currentDate = {}

  currentDate.day = new Date().getDate();
  currentDate.month = new Date().getMonth() + 1;
  currentDate.year = new Date().getFullYear();

  fs.readFile('./src/db/last_backup.json', 'utf8', function (err, data) {
    if(err) errorhandler({
      err,
      fatal: true
    })

    data = JSON.parse(data)

    if (currentDate.day > data.day || currentDate.month > data.month || currentDate.year > data.year) {
      const newDate = {}
      newDate.day = currentDate.day;
      newDate.month = currentDate.month;
      newDate.year = currentDate.year;

      fs.writeFileSync('./src/db/last_backup.json', JSON.stringify(newDate, null, 4))

      exec(` mysqldump -u ${dbconfig.user} -p'${dbconfig.password}' ${dbconfig.database} --no-tablespaces > ${dbconfig.backup_repo}/${newDate.day+'_'+newDate.month+'_'+newDate.year}.backup.sql`, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          errorhandler({
            error,
            fatal: true
          })
        }
      });
      setTimeout(() => {
        exec(` cd ${dbconfig.backup_repo} && git pull && git add . && git commit -m "${dbconfig.backup_repo}" && git push`, (error, stdout, stderr) => {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
            errorhandler({
              error,
              fatal: true
            })
          }
        });
        console.info(`Database backuped successfully`);
      }, 10000); //10s
      return true;

    }
  })
}