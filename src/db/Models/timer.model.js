const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class Timer extends Model {}

Timer.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        started_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ends_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endMessage: {
            type: DataTypes.TEXT,
        },
        message_id: {
            type: DataTypes.BIGINT,
        },
    },
    {
        sequelize: database,
        tableName: 'timer',
        timestamps: false,
    }
);

const timer = Timer;
module.exports = timer;
