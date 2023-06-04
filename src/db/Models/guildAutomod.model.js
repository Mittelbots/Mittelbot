const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class GuildAutomod extends Model {}

GuildAutomod.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: 'guild_id',
        },
        antispam: {
            type: DataTypes.JSON,
            defaultValue: {
                enabled: false,
                action: '',
                whitelist: [],
            },
        },
        antiinvite: {
            type: DataTypes.JSON,
            defaultValue: {
                enabled: false,
                action: '',
                whitelist: [],
            },
        },
        antiinsults: {
            type: DataTypes.JSON,
            defaultValue: {
                enabled: false,
                action: '',
                whitelist: [],
                words: [],
            },
        },
        antilinks: {
            type: DataTypes.JSON,
            defaultValue: {
                enabled: false,
                action: '',
                whitelist: [],
            },
        },
        whitelist: {
            type: DataTypes.JSON,
            defaultValue: [],
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
