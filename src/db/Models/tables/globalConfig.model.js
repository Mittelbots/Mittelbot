const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class GlobalConfig extends Model {}

GlobalConfig.init(
    {
        ingoreMode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        disabledCommands: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
    },
    {
        sequelize: database,
        tableName: 'global_config',
        timestamps: false,
    }
);

const globalConfig = GlobalConfig;
module.exports = globalConfig;
