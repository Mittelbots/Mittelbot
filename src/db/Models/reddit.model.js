const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class Reddit extends Model {}

Reddit.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subreddit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        uploads: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        pingrole: {
            type: DataTypes.BIGINT,
        },
        allow_nsfw: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize: database,
        tableName: 'reddit',
        timestamps: false,
    }
);

const reddit = Reddit;
module.exports = reddit;
