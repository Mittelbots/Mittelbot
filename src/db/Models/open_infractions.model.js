const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class OpenInfractions extends Model {}

OpenInfractions.init(
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
        till_date: {
            type: DataTypes.DATE,
        },
        reason: {
            type: DataTypes.STRING,
            defaultValue: 'No reason provided',
        },
        infraction_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
        },
        user_roles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
    },
    {
        sequelize: database,
        tableName: 'open_infractions',
        timestamps: false,
    }
);

const openInfractions = OpenInfractions;
module.exports = openInfractions;
