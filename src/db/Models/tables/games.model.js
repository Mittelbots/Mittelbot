const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class Games extends Model {}

Games.init(
    {
        game_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        guild_id: {
            type: DataTypes.STRING,
            unique: 'guild_id',
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        config: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
    },
    {
        sequelize: database,
        tableName: 'games',
        timestamps: false,
    }
);

const games = Games;
module.exports = games;
