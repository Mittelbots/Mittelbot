const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class GuildAutomod extends Model {}

GuildAutomod.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        settings: {
            type: DataTypes.JSON,
            defaultValue: { antispam: { enabled: false, action: '[]' } },
        },
    },
    {
        sequelize: database,
        tableName: 'guild_automod',
        timestamps: false,
    }
);

const guildAutomod = GuildAutomod;
module.exports = guildAutomod;
