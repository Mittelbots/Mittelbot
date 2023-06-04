const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class Banappeal extends Model {}

Banappeal.init(
    {
        guild_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        appeal_msg: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        isAccepted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        cooldown: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: database,
        tableName: 'banappeal',
        timestamps: false,
    }
);

const banappealModel = Banappeal;
module.exports = banappealModel;
