<<<<<<< HEAD
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
require('dotenv').config();

const database = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: (...msg) => {
            if (msg[1].showWarnings) {
                errorhandler({
                    message: msg,
                    fatal: true,
                });
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        retry: {
            max: 3,
        },
        define: {
            freezeTableName: true,
            timestamps: false,
        },
    }
);

database.init = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const dir = path.resolve('src/db/Models/tables/');
            await database
                .authenticate()
                .then(() => {
                    fs.readdirSync(dir).forEach(async (file) => {
                        console.log('Loading model: ' + file);
                        const model = require(path.join(dir, file));
                        new model();
                    });
                })
                .catch((err) => {
                    errorhandler({
                        message: 'There was an error when creating models: ' + err.toString(),
                        fatal: true,
                    });
                });
            await database.sync({
                alter: true,
            });

            const data_mg_path = path.resolve('src/db/data_migration/');
            fs.readdirSync(data_mg_path).forEach(async (file) => {
                if (!file.includes('.default')) return;
                console.log('Inserting default data from: ' + file);
                require(path.join(data_mg_path, file));
            });
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
};

database.afterSync(async (connection) => {
    console.log(`Successfully synced ${connection.name.plural}.`);
});

database.afterDestroy((error) => {
    errorhandler({
        message: 'Database connection error! ' + error.toString(),
        fatal: true,
    });
});
=======
const mysql = require('mysql');
class Database {
  constructor() {
    this.connection = mysql.createPool({
      connectionLimit: 50,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      debug: JSON.parse(process.env.DB_DEBUG),
      multipleStatements: true
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
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

module.exports = database;