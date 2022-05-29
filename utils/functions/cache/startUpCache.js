const { getAllConfig } = require("../getData/getConfig");
const { getAllModroles } = require("../getData/getModroles");
const { getAllJoinroles } = require("../getData/getJoinroles");
const { getAllLogs } = require('../getData/getLogs');
const { addToCache } = require("./cache");
const { getAllXP } = require("../levelsystem/levelsystemAPI");
const { getAllMemberInfo } = require('../getData/getMemberInfo');

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
                    deleeteCommandAfterUsage: guildConfigs[i].deleeteCommandAfterUsage,
                    levelsettings: guildConfigs[i].levelsettings,
                    translate_channel: guildConfigs[i].translate_channel,
                    translate_language: guildConfigs[i].translate_language,
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
                    role_id: (typeof guildJoinroles[i].joinroles === "object") ? guildJoinroles[i].joinroles : '',
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
                    audit_log: guildLogs[i].logs.audit_log,
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

    console.log('✅ Everything is in cache...');
    console.log('----------------------------------------');
}