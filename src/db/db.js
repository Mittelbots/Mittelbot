const { createConnection } = require('mysql');
const dbconfig = require('./db_config.json');

class Database {
  constructor() {
    this.connection = createConnection({
      host: dbconfig.host,
      user: dbconfig.user,
      password: dbconfig.password,
      database: dbconfig.database,
    });
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if(err) return reject(err);
        resolve(rows);
      })
    })
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err =>{
        if(err) return reject(err);
        resolve();
      })
    })
  }
}

module.exports = { Database };