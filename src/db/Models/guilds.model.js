const { Model, DataTypes } = require('sequelize');
const database = require('../db');
const closedInfractions = require('./closedInfractions.model');
const guildAutomod = require('./guildAutomod.model');
const guildConfig = require('./guildConfig.model');
const guildLevel = require('./guildLevel.model');
const guildUploads = require('./guildUploads.model');
const memberInfo = require('./memberInfo.model');
const openInfractions = require('./open_infractions.model');
const temproles = require('./temproles.model');
const ticketModel = require('./tickets.model');
const twitchStreams = require('./twitchStreams.model');

class Guilds extends Model {}

Guilds.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            unique: 'guild_id',
        },
    },
    {
        sequelize: database,
        tableName: 'guilds',
        timestamps: false,
    }
);

Guilds.hasOne(guildConfig, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'config',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasOne(guildAutomod, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'automod',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(closedInfractions, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'closedInfractions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(openInfractions, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'openInfractions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(guildLevel, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'level',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(guildUploads, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'uploads',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(memberInfo, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'memberInfo',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(temproles, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'temproles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(twitchStreams, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'twitchStreams',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Guilds.hasMany(ticketModel, {
    foreignKey: 'guild_id',
    sourceKey: 'guild_id',
    as: 'tickets',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

const guilds = Guilds;
module.exports = guilds;
