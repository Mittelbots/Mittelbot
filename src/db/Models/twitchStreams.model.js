const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class TwitchStreams extends Model {}

TwitchStreams.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        twitch_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        isStreaming: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        dc_channel_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        pingrole: {
            type: DataTypes.BIGINT,
        },
        message: {
            type: DataTypes.STRING,
        },
        streamStartedAt: {
            type: DataTypes.DATE,
        },
        embedUpdatedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize: database,
        tableName: 'twitch_streams',
        timestamps: false,
    }
);

const twitchStreams = TwitchStreams;
module.exports = twitchStreams;
