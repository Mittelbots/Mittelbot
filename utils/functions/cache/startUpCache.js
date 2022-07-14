const { getAllConfig } = require("../data/getConfig");
const { getAllModroles } = require("../data/getModroles");
const { getAllJoinroles } = require("../data/joinroles");
const { getAllLogs } = require('../data/getLogs');
const { addToCache } = require("./cache");
const { getAllXP } = require("../levelsystem/levelsystemAPI");
const { getAllMemberInfo } = require('../data/getMemberInfo');
const { getAllWarnroles } = require("../data/warnroles");
const { getAllForms } = require("../data/apply_form");
const { getAllAutoMod } = require("../data/automod");

module.exports.startUpCache = async () => {

    console.log('----------------------------------------');
    console.log('🚀Starting up cache...');


    console.log('🕐Getting all Data...');

    const guildConfigs = await getAllConfig();
    const guildModroles = await getAllModroles();
    const guildJoinroles = await getAllJoinroles();
    const guildLogs = await getAllLogs();
    const guildXp = await getAllXP();
    const guildMemberInfo = await getAllMemberInfo();
    const guildWarnRoles = await getAllWarnroles();
    const guildApplyForms = await getAllForms();
    const guildAutoMod = await getAllAutoMod();

    console.log('✅ Data collected...');

    console.log('🕐Adding to cache...');

    for(let i in guildConfigs) {
        if(!guildConfigs[i] || !guildConfigs[i].guild_id) continue;
        await addToCache({
            value: {
                name: "config",
                data: {
                    id: guildConfigs[i].guild_id,
                    prefix: guildConfigs[i].prefix,
                    welcome_channel: guildConfigs[i].welcome_channel,
                    cooldown: guildConfigs[i].cooldown,
                    deleteModCommandAfterUsage: guildConfigs[i].deleteModCommandAfterUsage,
                    deleteCommandAfterUsage: guildConfigs[i].deleteCommandAfterUsage,
                    levelsettings: guildConfigs[i].levelsettings,
                    translate_target: guildConfigs[i].translate_target,
                    translate_log_channel: guildConfigs[i].translate_log_channel,
                    translate_language: guildConfigs[i].translate_language,
                    disabled_modules: guildConfigs[i].disabled_modules,
                }
            }
        });
    }

    for(let i in guildModroles) {
        if(!guildModroles[i] || !guildModroles[i].modroles) continue;

        const isObject = typeof guildModroles[i].modroles === 'object';
        await addToCache({
            value: {
                name: "modroles",
                data: {
                    id: guildModroles[i].guild_id,
                    modroles: isObject ? guildModroles[i].modroles : ''
                }
            }
        });
    }

    for(let i in guildJoinroles) {
        if(!guildJoinroles[i]) continue;
        await addToCache({
            value: {
                name: "joinroles",
                data: {
                    id: guildJoinroles[i].guild_id,
                    role_id: (typeof guildJoinroles[i].joinroles === "object") ? guildJoinroles[i].joinroles : [],
                }
            }
        });
    }

    for(let i in guildLogs) {
        if(!guildLogs[i]) continue;
        await addToCache({
            value: {
                name: "logs",
                data: {
                    id: guildLogs[i].guild_id,
                    auditlog: guildLogs[i].logs.auditlog,
                    messagelog: guildLogs[i].logs.messagelog,
                    modlog: guildLogs[i].logs.modlog,
                }
            }
        });
    }


    for(let i in guildXp) {
        if(!guildXp[i]) continue;
        await addToCache({
            value: {
                name: "xp",
                data: {
                    id: guildXp[i].guild_id,
                    xp: (guildXp[i].xp) ? guildXp[i].xp : '',
                }
            }
        });
    }


    for(let i in guildMemberInfo) {
        if(!guildMemberInfo[i]) continue;
        await addToCache({
            value: {
                name: "memberInfo",
                data: {
                    id: guildMemberInfo[i].guild_id,
                    memberInfo: (guildMemberInfo[i].member_info) ? guildMemberInfo[i].member_info : '',
                }
            }
        });
    }

    for(let i in guildWarnRoles) {
        if(!guildWarnRoles[i]) continue;
        await addToCache({
            value: {
                name: "warnroles",
                data: {
                    id: guildWarnRoles[i].guild_id,
                    roles: (typeof guildWarnRoles[i].warnroles === "object") ? guildWarnRoles[i].warnroles : [],
                }
            }
        });
    }

    for(let i in guildApplyForms) {
        if(!guildApplyForms[i]) continue;
        await addToCache({
            value: {
                name: "applyforms",
                id: guildApplyForms[i].forms[0].guild_id,
                data: {
                    forms: guildApplyForms[i].forms || [],
                }
            }
        });
    }

    for(let i in guildAutoMod) {
        if(!guildAutoMod[i]) continue;
        await addToCache({
            value: {
                name: "autoMod",
                id: guildAutoMod[i].guild_id,
                data: {
                    settings: guildAutoMod[i].setting || [],
                }
            }
        });
    }
    
    console.log('✅ Everything is in cache...');
    console.log('----------------------------------------');
}