const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class GuildAutoBlacklist extends Model {}

GuildAutoBlacklist.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            unique: 'guild_id',
        },
        channel: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize: database,
        tableName: 'guildAutoBlacklist',
        timestamps: false,
    }
);

const guildAutoBlacklist = GuildAutoBlacklist;
module.exports = guildAutoBlacklist;
