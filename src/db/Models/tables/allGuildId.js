const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class AllGuildId extends Model {}

AllGuildId.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
        },
    },
    {
        sequelize: database,
        tableName: 'all_guild_id',
        timestamps: false,
    }
);

const allGuildId = AllGuildId;
module.exports = allGuildId;
