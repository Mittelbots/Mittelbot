const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class ExcludeChannel extends Model {}

ExcludeChannel.init(
    {
        guild_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isOnlyMedia: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOnlyText: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOnlyEmotes: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOnlyStickers: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize: database,
        tableName: 'exclude_channel',
        timestamps: false,
    }
);

const excludeChannelModel = ExcludeChannel;
module.exports = excludeChannelModel;
