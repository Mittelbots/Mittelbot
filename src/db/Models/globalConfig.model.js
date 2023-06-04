const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class GlobalConfig extends Model {}

GlobalConfig.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        ignoreMode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        disabled_commands: {
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
