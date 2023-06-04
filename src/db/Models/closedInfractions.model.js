const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class ClosedInfractions extends Model {}

ClosedInfractions.init(
    {
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        mod_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        mute: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        ban: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        warn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        kick: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        till_date: {
            type: DataTypes.DATE,
        },
        reason: {
            type: DataTypes.STRING,
        },
        infraction_id: {
            type: DataTypes.STRING,
        },
        start_date: {
            type: DataTypes.DATE,
        },
        guild_id: {
            type: DataTypes.BIGINT,
        },
    },
    {
        sequelize: database,
        tableName: 'closed_infractions',
        timestamps: false,
    }
);

const closedInfractions = ClosedInfractions;
module.exports = closedInfractions;
