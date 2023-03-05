const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class Tickets extends Model {}

Tickets.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: 'guild_id',
        },
        channel_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: 'channel_id',
        },
        ticket_owner: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        ticket_messages: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        ticket_status: {
            type: DataTypes.STRING,
            defaultValue: 'open',
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
