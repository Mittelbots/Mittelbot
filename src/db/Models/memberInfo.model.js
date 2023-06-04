const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class MemberInfo extends Model {}

MemberInfo.init(
    {
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        member_roles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        user_joined: {
            type: DataTypes.DATE,
        },
        afk: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
    },
    {
        sequelize: database,
        tableName: 'member_info',
        timestamps: false,
    }
);

const memberInfo = MemberInfo;
module.exports = memberInfo;
