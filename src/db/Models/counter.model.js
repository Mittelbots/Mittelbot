const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class Counter extends Model {}

Counter.init(
    {
        guild_id: {
            type: DataTypes.STRING,
            unique: 'guild_id',
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            unique: 'guild_id',
            allowNull: false,
        },
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        last_user: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize: database,
        tableName: 'counter',
        timestamps: false,
    }
);

const counter = Counter;
module.exports = counter;
