const mysql = require('mysql');
const dbconfig = require('./db_config.json');
const config = require('../assets/json/_config/config.json')

class Database {
  constructor() {
    this.connection = mysql.createPool({
      connectionLimit: 50,
      host: dbconfig.host,
      user: dbconfig.user,
      password: dbconfig.password,
      database: dbconfig.database,
      debug: config.db_config
    });

    this.connection.getConnection((err, connection) => {
      if (err) throw err;
      console.log('-------Database connected successfully------');
      connection.release();
    });
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      })
    })
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) return reject(err);
        resolve();
      })
    })
  }
}

const database = new Database();

module.exports = database;