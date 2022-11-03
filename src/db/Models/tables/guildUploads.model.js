const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class GuildUploads extends Model {}

GuildUploads.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        info_channel_id: {
            type: DataTypes.BIGINT,
        },
        uploads: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        pingrole: {
            type: DataTypes.BIGINT,
        },
    },
    {
        sequelize: database,
        tableName: 'guild_level',
        timestamps: false,
    }
);

const guildUploads = GuildUploads;
module.exports = guildUploads;
