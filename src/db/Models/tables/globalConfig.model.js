const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

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

GlobalConfig.create({
    id: 1,
    ignoreMode: false,
    disabledCommands: [],
});

const globalConfig = GlobalConfig;
module.exports = globalConfig;
