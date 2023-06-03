const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class AutoDelete extends Model {}

AutoDelete.init(
    {
        guild_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isOnlyMedia: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOnlyText: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOnlyEmotes: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOnlyStickers: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize: database,
        tableName: 'autodelete',
        timestamps: false,
    }
);

const autodeleteModel = AutoDelete;
module.exports = autodeleteModel;
