const { Model, DataTypes } = require('sequelize');
const database = require('../../db');

class GuildConfig extends Model {}

GuildConfig.init(
    {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: 'guild_id',
        },
        welcome_channel: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        apply_form: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        start: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        levelup_channel: {
            type: DataTypes.BIGINT,
        },
        levelsettings: {
            type: DataTypes.JSON,
            defaultValue: { mode: 'normal', levelup_channel: 'disable' },
        },
        joinroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        modroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        prefix: {
            type: DataTypes.STRING,
            defaultValue: '!',
        },
        cooldown: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        translate_target: {
            type: DataTypes.BIGINT,
        },
        translate_language: {
            type: DataTypes.STRING,
            defaultValue: 'en',
        },
        disabled_modules: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        deleteModeCommandAfterUsage: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        deleteCommandAfterUsage: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        translate_log_channel: {
            type: DataTypes.BIGINT,
        },
        logs: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        warnroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        disabled_commands: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
    },
    {
        sequelize: database,
        tableName: 'guild_config',
        timestamps: false,
    }
);

const guildConfig = GuildConfig;
module.exports = guildConfig;
