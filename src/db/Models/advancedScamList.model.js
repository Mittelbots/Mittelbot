const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class AdvancedScamList extends Model {}

AdvancedScamList.init(
    {
        link: {
            type: DataTypes.STRING,
        },
        blacklist: {
            type: DataTypes.STRING,
        },
        whitelist_link: {
            type: DataTypes.STRING,
        },
        request_link: {
            type: DataTypes.STRING,
        },
        request_user: {
            type: DataTypes.BIGINT,
        },
        request_type: {
            type: DataTypes.STRING,
        },
        request_id: {
            type: DataTypes.STRING,
        },
        request_message: {
            type: DataTypes.JSON,
        },
        request_guild: {
            type: DataTypes.BIGINT,
        },
    },
    {
        sequelize: database,
        tableName: 'advancedScamList',
        timestamps: false,
    }
);

const advancedScamList = AdvancedScamList;
module.exports = advancedScamList;
