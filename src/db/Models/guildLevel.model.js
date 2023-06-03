const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class GuildLevel extends Model {}

GuildLevel.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
        },
        xp: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        user_id: {
            type: DataTypes.BIGINT,
        },
        level_announce: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
        },
        message_count: {
            type: DataTypes.BIGINT,
            defaultValue: 1,
        },
        last_message: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize: database,
        tableName: 'guild_level',
        timestamps: false,
    }
);

const guildLevel = GuildLevel;
module.exports = guildLevel;
