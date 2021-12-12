const { createConnection } = require('mysql');
const dbconfig = require('./db_config.json');
const config = require('../../config.json');

const database = createConnection({
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
});

function mysql_handleDisconnect() {
  database.connect((err) => {
    if(err) {
      console.log(`${config.errormessages.databaseconnectionerror}`, err);
      setTimeout(() => {
        mysql_handleDisconnect();
      }, 5000);
    }
    console.log(`${config.successmessages.database}`);
  });
}

mysql_handleDisconnect();

module.exports = { database };