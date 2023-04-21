const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class Music extends Model {}

Music.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            unique: 'guild_id',
        },
        queue: {
            type: DataTypes.JSON,
        },
        isPlaying: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize: database,
        tableName: 'music',
        timestamps: false,
    }
);

const musicModel = Music;
module.exports = musicModel;
