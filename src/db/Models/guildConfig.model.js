const { Model, DataTypes } = require('sequelize');
const database = require('../db');

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
        levelup_channel: {
            type: DataTypes.BIGINT,
        },
        levelsettings: {
            type: DataTypes.JSON,
            defaultValue: { mode: 'normal', levelup_channel: 'disable', blacklistchannels: [] },
        },
        joinroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        modroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        cooldown: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        translate: {
            type: DataTypes.JSON,
            defaultValue: {
                mode: 'disable',
                translate_log_channel: '',
                translate_language: 'en',
                translate_target: '',
            },
        },
        modules: {
            type: DataTypes.JSON,
            defaultValue: {
                enabled: [],
                disabled: [],
            },
        },
        logs: {
            type: DataTypes.JSON,
            defaultValue: {
                events: [
                    'guildMemberNicknameUpdate',
                    'guildMemberOffline',
                    'guildMemberOnline',
                    'guildMemberRoleAdd',
                    'guildMemberRoleRemove',
                    'userAvatarUpdate',
                    'userUsernameUpdate',
                ],
            },
        },
        warnroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        disabled_commands: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        reactionroles: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        banappeal: {
            type: DataTypes.JSON,
            defaultValue: {
                title: 'Ban Appeal for {user}',
                description: 'Please answer the following questions to appeal your ban.',
                questions: ['Why should we unban you?', 'Why did you break the rules?'],
            },
        },
        tickets: {
            type: DataTypes.JSON,
            defaultValue: [],
        },
        muterole: {
            type: DataTypes.BIGINT,
        },
        lang: {
            type: DataTypes.STRING,
            defaultValue: 'en_US',
        },
        firstCommand: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
