const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class SingASong extends Model {}

SingASong.init(
    {
        user_id: {
            type: DataTypes.STRING,
            unique: 'user_id',
        },
        guild_id: {
            type: DataTypes.STRING,
            unique: 'guild_id',
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        used_sentences: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        isCurrentlyPlaying: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        banned: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        upvotes: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
    },
    {
        sequelize: database,
        tableName: 'singasong',
        timestamps: false,
    }
);

const singasong = SingASong;
module.exports = singasong;
