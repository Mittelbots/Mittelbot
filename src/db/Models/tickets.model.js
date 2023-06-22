const { Model, DataTypes } = require('sequelize');
const database = require('../db');

class Tickets extends Model {}

Tickets.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        channel_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: 'channel_id',
        },
        owner: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        source_message_link: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        closed_by: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize: database,
        tableName: 'tickets',
        timestamps: true,
    }
);

const ticketModel = Tickets;
module.exports = ticketModel;
