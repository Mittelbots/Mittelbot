const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class Temproles extends Model {}

Temproles.init(
    {
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        role_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        till_date: {
            type: DataTypes.DATE,
        },
        infraction_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
    },
    {
        sequelize: database,
        tableName: 'temproles',
        timestamps: false,
    }
);

const temproles = Temproles;
module.exports = temproles;
