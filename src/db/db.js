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

(async () => {
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

    process.exit(0);
})();

database.afterSync(async (connection) => {
    console.log(`Successfully synced ${connection.name.plural}.`);
});

database.afterDestroy((error) => {
    errorhandler({
        message: 'Database connection error! ' + error.toString(),
        fatal: true,
    });
});

module.exports = database;
