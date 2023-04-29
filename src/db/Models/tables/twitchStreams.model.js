const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class TwitchStreams extends Model {}

TwitchStreams.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        isStreaming: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        info_channel_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        pingrole: {
            type: DataTypes.BIGINT,
        },
        channel_name: {
            type: DataTypes.STRING,
            allowNull: false,
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
