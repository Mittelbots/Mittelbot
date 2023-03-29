const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const SequelizeModel = require('sequelize/lib/model');
require('dotenv').config();

const database = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        retry: {
            max: 7,
        },
        define: {
            freezeTableName: true,
            timestamps: false,
        },
    }
);

const orgFindAll = SequelizeModel.findAll;
SequelizeModel.findAll = function () {
    return orgFindAll.apply(this, arguments).catch((err) => {
        errorhandler({ err, databaseError: true });
        throw err;
    });
};
const orgFindOne = SequelizeModel.findOne;
SequelizeModel.findOne = function () {
    return orgFindOne.apply(this, arguments).catch((err) => {
        errorhandler({ err, databaseError: true });
        throw err;
    });
};
const orgFindOrCreate = SequelizeModel.findOrCreate;
SequelizeModel.findOrCreate = function () {
    return orgFindOrCreate.apply(this, arguments).catch((err) => {
        errorhandler({ err, databaseError: true });
        throw err;
    });
};
const orgCreate = SequelizeModel.create;
SequelizeModel.create = function () {
    return orgCreate.apply(this, arguments).catch((err) => {
        errorhandler({ err, databaseError: true });
        throw err;
    });
};
const orgUpdate = SequelizeModel.update;
SequelizeModel.update = function () {
    return orgUpdate.apply(this, arguments).catch((err) => {
        errorhandler({ err, databaseError: true });
        throw err;
    });
};
const orgDestroy = SequelizeModel.destroy;
SequelizeModel.destroy = function () {
    return orgDestroy.apply(this, arguments).catch((err) => {
        errorhandler({ err, databaseError: true });
        throw err;
    });
};

database.init = () => {
    return new Promise(async (resolve, reject) => {
        const dir = path.resolve('src/db/Models/tables/');
        await database
            .authenticate()
            .then(() => {
                fs.readdirSync(dir).forEach((file) => {
                    console.log('Loading model: ' + file);
                    require(path.join(dir, file));
                });
            })
            .catch((err) => {
                reject(err);
                errorhandler({
                    message: 'There was an error when creating models: ' + err.toString(),
                    fatal: true,
                });
            });
        await database.sync({
            alter: true,
        });

        const data_mg_path = path.resolve('src/db/data_migration/');
        fs.readdirSync(data_mg_path).forEach((file) => {
            if (!file.includes('.default')) return;
            console.log('Loading data migration: ' + file);
            require(path.join(data_mg_path, file));
        });
        resolve(true);
    });
};

database.afterSync((connection) => {
    console.log(`Successfully synced ${connection.name.plural}.`);
});

function errorHandler(err) {
    errorhandler({ err });
}

database.afterFind((result, options) => {
    //check if a error occured

    if (result instanceof Error) {
        console.log('Error occured in afterFind hook');
        errorHandler(result);
    }
});

database.afterQuery((result, options) => {
    //check if a error occured
    if (result instanceof Error) {
        console.log('Error occured in afterQuery hook');
        errorHandler(result);
    }
});

// afterCreate
database.afterCreate((result, options) => {
    // Aktionen ausführen
});

// afterUpdate
database.afterUpdate((result, options) => {
    // Aktionen ausführen
});

// afterDestroy
database.afterDestroy((result, options) => {
    // Aktionen ausführen
});

// afterBulkCreate
database.afterBulkCreate((result, options) => {
    // Aktionen ausführen
});

// afterBulkUpdate
database.afterBulkUpdate((result, options) => {
    // Aktionen ausführen
});

// afterBulkDestroy
database.afterBulkDestroy((result, options) => {
    // Aktionen ausführen
});

module.exports = database;
