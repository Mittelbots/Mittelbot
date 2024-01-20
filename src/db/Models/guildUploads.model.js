const { Model, DataTypes } = require('sequelize');
const database = require('../db');

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
        messageId: {
            type: DataTypes.BIGINT,
        },
        updateCount: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
        },
        subs: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
        },
    },
    {
        sequelize: database,
        tableName: 'guild_uploads',
        timestamps: true,
    }
);

const guildUploads = GuildUploads;
module.exports = guildUploads;
