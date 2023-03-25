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
        owner: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        messages: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        source_message_link: {
            type: DataTypes.STRING,
            allowNull: false,
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
